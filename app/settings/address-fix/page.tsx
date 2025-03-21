"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { Loader2, CheckCircle } from "lucide-react"
import type { Member } from "@/lib/db"

export default function AddressFixPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)
  const [needsFixCount, setNeedsFixCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchMembers() {
      setIsLoading(true)
      try {
        if (!db) throw new Error("Firestore is not initialized")
        
        const membersRef = collection(db, "members")
        const snapshot = await getDocs(membersRef)
        const memberData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Member[]
        
        setMembers(memberData)
        
        // 修正が必要な会員の数を計算
        const needsFix = memberData.filter(member => 
          (member.address && !member.streetAddress && hasAddressNumber(member.address)) ||
          (member.address && hasFullWidthNumber(member.address)) ||
          (member.streetAddress && hasFullWidthNumber(member.streetAddress))
        ).length
        
        setNeedsFixCount(needsFix)
      } catch (error) {
        console.error("Error fetching members:", error)
        toast({
          variant: "destructive",
          title: "エラー",
          description: "会員情報の取得に失敗しました",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMembers()
  }, [toast])

  // 住所に番地（数字とハイフン）が含まれているかを確認
  const hasAddressNumber = (address: string): boolean => {
    // 全角数字を検出する条件を限定し、分離対象の住所パターンのみ検出
    return /[0-9０-９]+[-－][0-9０-９]+/.test(address) || /[0-9０-９]+番地/.test(address);
  }

  // 住所に全角数字が含まれているかを確認
  const hasFullWidthNumber = (text: string): boolean => {
    return /[０-９]/.test(text);
  }

  // 全角数字を半角に変換する関数
  const convertFullWidthToHalfWidth = (text: string): string => {
    // 全角数字→半角数字の変換マップ
    const fullWidthToHalfWidth: Record<string, string> = {
      '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
      '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
      '－': '-', '　': ' ', '（': '(', '）': ')'
    };
    
    return text.split('').map(char => fullWidthToHalfWidth[char] || char).join('');
  }

  // 住所から番地部分を抽出
  const extractStreetAddress = (address: string): { cityAddress: string, streetAddress: string } => {
    // 住所はすでに半角に変換済みと想定
    const normalizedAddress = address;
    
    // パターン1: 数字-数字（例: 1-2-3）
    const numericPattern = /^(.*?)(\d+[-－]\d+.*)$/
    
    // パターン2: 「〜番地」
    const banchiPattern = /^(.*?)(\d+番地.*)$/
    
    let match = normalizedAddress.match(numericPattern) || normalizedAddress.match(banchiPattern)
    
    if (match) {
      const cityAddress = match[1].trim();
      const streetAddress = match[2].trim();
      
      // 都道府県名や市区町村名が含まれているか確認
      const containsRegionalName = /[都道府県市区町村]/.test(cityAddress);
      
      // 有効な住所部分のみを返す（空や単なるスペースではない場合）
      if (cityAddress && containsRegionalName) {
        return {
          cityAddress: cityAddress,
          streetAddress: streetAddress
        }
      }
    }
    
    // 他のパターン: 数字から始まる場合
    const numberStartPattern = /^(.*?)(\d+.*)$/
    match = normalizedAddress.match(numberStartPattern)
    
    if (match) {
      const cityAddress = match[1].trim();
      const streetAddress = match[2].trim();
      
      // 都道府県名や市区町村名が含まれているか確認
      const containsRegionalName = /[都道府県市区町村]/.test(cityAddress);
      
      // 有効な住所部分のみを返す
      if (cityAddress && containsRegionalName) {
        return {
          cityAddress: cityAddress,
          streetAddress: streetAddress
        }
      }
    }
    
    // 分離できない場合はそのまま返す
    return {
      cityAddress: normalizedAddress,
      streetAddress: ""
    }
  }

  const processAddresses = async () => {
    setIsProcessing(true)
    setProcessedCount(0)
    let fixedCount = 0
    let fullWidthConvertedCount = 0

    try {
      if (!db) throw new Error("Firestore is not initialized")

      // 番地が含まれている可能性のある住所または全角数字を含む住所を持つメンバーをフィルタリング
      const membersToFix = members.filter(member => 
        (member.address && !member.streetAddress && hasAddressNumber(member.address)) ||
        (member.address && hasFullWidthNumber(member.address)) ||
        (member.streetAddress && hasFullWidthNumber(member.streetAddress))
      )
      
      for (const member of membersToFix) {
        if (!member.id) continue
        
        let needsUpdate = false;
        const updates: Record<string, string> = {};
        
        // まず全角数字を含む住所と番地を半角に変換
        let processedAddress = member.address || "";
        let processedStreetAddress = member.streetAddress || "";
        
        if (member.address && hasFullWidthNumber(member.address)) {
          processedAddress = convertFullWidthToHalfWidth(member.address);
          if (processedAddress !== member.address) {
            updates.address = processedAddress;
            needsUpdate = true;
            fullWidthConvertedCount++;
          }
        }
        
        if (member.streetAddress && hasFullWidthNumber(member.streetAddress)) {
          processedStreetAddress = convertFullWidthToHalfWidth(member.streetAddress);
          if (processedStreetAddress !== member.streetAddress) {
            updates.streetAddress = processedStreetAddress;
            needsUpdate = true;
            fullWidthConvertedCount++;
          }
        }
        
        // 重複チェック - 住所に番地が含まれていて、かつ番地フィールドが空の場合
        if (processedAddress && !processedStreetAddress && hasAddressNumber(processedAddress)) {
          const { cityAddress, streetAddress } = extractStreetAddress(processedAddress);
          
          // 住所の分離が成功し、元の住所と異なり、かつ抽出した番地が有効な場合
          if (streetAddress && cityAddress !== processedAddress) {
            // 住所から番地部分だけが正しく抽出されたことを確認する
            if (processedAddress.includes(streetAddress) && !cityAddress.includes(streetAddress)) {
              updates.address = cityAddress;
              updates.streetAddress = streetAddress;
              needsUpdate = true;
              fixedCount++;
            }
          }
        }
        
        // 更新が必要な場合、Firestoreを更新
        if (needsUpdate && Object.keys(updates).length > 0) {
          const memberRef = doc(db, "members", member.id);
          await updateDoc(memberRef, updates);
        }
        
        setProcessedCount(prev => prev + 1);
      }
      
      toast({
        title: "住所の整理が完了しました",
        description: `${fixedCount}件の住所データを分離し、${fullWidthConvertedCount}件の全角数字を半角に変換しました`,
      })
      
      // 処理完了後に再度会員データを取得
      const membersRef = collection(db, "members")
      const snapshot = await getDocs(membersRef)
      const updatedMemberData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Member[]
      
      setMembers(updatedMemberData)
      setNeedsFixCount(0)
    } catch (error) {
      console.error("Error processing addresses:", error)
      toast({
        variant: "destructive",
        title: "エラー",
        description: "住所データの修正中にエラーが発生しました",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-primary">住所データ整理ツール</h1>
      <p className="text-muted-foreground">
        このツールは会員の住所データから番地部分を分離し、適切なフィールドに振り分けます。
      </p>

      <Card>
        <CardHeader>
          <CardTitle>住所データの整理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
                <h3 className="font-medium text-amber-800 mb-2">データ分析結果</h3>
                <p className="text-amber-700">
                  会員総数: <span className="font-medium">{members.length}名</span>
                </p>
                <p className="text-amber-700">
                  修正が必要な住所データ: <span className="font-medium">{needsFixCount}件</span>
                  <span className="text-xs ml-2">(住所/番地の分離、全角数字の修正)</span>
                </p>
              </div>

              {needsFixCount > 0 ? (
                <Button 
                  onClick={processAddresses} 
                  disabled={isProcessing} 
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      処理中... ({processedCount}/{needsFixCount})
                    </>
                  ) : (
                    "住所データを整理する"
                  )}
                </Button>
              ) : (
                <div className="flex items-center justify-center py-4 text-primary gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>すべての住所データは整理済みです</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>このツールについて</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="font-medium mb-2">対応パターン例</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>「東京都新宿区西新宿2-8-1」→「東京都新宿区西新宿」と「2-8-1」に分離</li>
            <li>「大阪府大阪市中央区心斎橋筋1丁目10-11」→「大阪府大阪市中央区心斎橋筋」と「1丁目10-11」に分離</li>
            <li>「北海道札幌市中央区北1条西2-3-4 ○○ビル101」→「北海道札幌市中央区北1条西」と「2-3-4 ○○ビル101」に分離</li>
            <li>全角数字「１２３４」→半角数字「1234」に変換</li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            ※ 自動処理で分離できなかった住所は手動で修正する必要があります。
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 