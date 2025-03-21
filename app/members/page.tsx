"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PDFDownloadButton } from "@/components/pdf-download-button"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
import type { Member } from "@/lib/db"
import { formatCertificateNumber } from "@/lib/db"

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [nameFilter, setNameFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [prefectureFilter, setPrefectureFilter] = useState("all")

  // Firestoreからリアルタイムでデータを取得
  useEffect(() => {
    if (!db) {
      console.error("Firestore is not initialized")
      setIsLoading(false)
      return
    }

    console.log("Fetching members from Firestore...");

    // クリーンアップ関数を準備
    let unsubscribe: () => void = () => {}

    try {
      const membersRef = collection(db, "members")
      const q = query(membersRef, orderBy("createdAt", "desc"))
      
      // リアルタイムリスナーをセットアップ
      unsubscribe = onSnapshot(q, (snapshot) => {
        console.log(`Got ${snapshot.docs.length} members from Firestore`);
        const memberData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Member[]
        
        setMembers(memberData)
        setFilteredMembers(memberData)
        setIsLoading(false)
      }, (error) => {
        console.error("Realtime data error:", error)
        setIsLoading(false)
      })
    } catch (error) {
      console.error("Error setting up realtime listener:", error)
      setIsLoading(false)
    }

    // コンポーネントのアンマウント時にリスナーを解除
    return () => unsubscribe()
  }, [])

  const handleFilter = useCallback(() => {
    const filtered = members.filter(
      (member) =>
        (nameFilter === "" || 
         member.name?.includes(nameFilter) || 
         member.furigana?.includes(nameFilter)) &&
        (typeFilter === "all" || 
         // typesフィールドがある場合はそれを使用、なければtypeフィールドをチェック
         (member.types?.includes(typeFilter) || member.type === typeFilter)) &&
        (prefectureFilter === "all" || member.prefecture === prefectureFilter),
    )
    setFilteredMembers(filtered)
  }, [nameFilter, typeFilter, prefectureFilter, members])

  // フィルター条件が変更されたら自動的にフィルタリングを実行
   
  useEffect(() => {
    handleFilter()
  }, [handleFilter])

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-primary md:text-3xl">会員リスト</h1>
        <Button className="w-full rounded-full sm:w-auto" asChild>
          <Link href="/members/new">
            <span className="px-2">＋ 新規会員登録</span>
          </Link>
        </Button>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm md:p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-4 md:gap-4">
              <div className="relative col-span-full md:col-span-1">
                <div className="text-sm font-medium text-gray-700 mb-1">名前・ふりがな検索</div>
                <Search className="absolute left-3 top-[calc(50%+0.5rem)] h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="名前やふりがなで検索..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">資格種別</div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="資格種別で絞り込み" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全ての資格種別</SelectItem>
                    <SelectItem value="ベビーマッサージマスター">ベビーマッサージマスター</SelectItem>
                    <SelectItem value="ベビーヨガマスター">ベビーヨガマスター</SelectItem>
                    <SelectItem value="ベビーマッサージインストラクター">ベビーマッサージインストラクター</SelectItem>
                    <SelectItem value="ベビーヨガインストラクター">ベビーヨガインストラクター</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">都道府県</div>
                <Select value={prefectureFilter} onValueChange={setPrefectureFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="都道府県で絞り込み" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全ての都道府県</SelectItem>
                    <SelectItem value="大阪府">大阪府</SelectItem>
                    <SelectItem value="東京都">東京都</SelectItem>
                    <SelectItem value="京都府">京都府</SelectItem>
                    <SelectItem value="北海道">北海道</SelectItem>
                    <SelectItem value="福岡県">福岡県</SelectItem>
                    <SelectItem value="愛知県">愛知県</SelectItem>
                    <SelectItem value="神奈川県">神奈川県</SelectItem>
                    <SelectItem value="兵庫県">兵庫県</SelectItem>
                    <SelectItem value="宮城県">宮城県</SelectItem>
                    <SelectItem value="広島県">広島県</SelectItem>
                    <SelectItem value="沖縄県">沖縄県</SelectItem>
                    <SelectItem value="静岡県">静岡県</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">操作</div>
                <Button onClick={handleFilter} className="w-full">
                  絞り込み
                </Button>
              </div>
            </div>

            <div className="mt-4 mb-2 text-sm">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-gray-500">現在の絞り込み：</span>
                {nameFilter && (
                  <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                    名前/ふりがな: {nameFilter}
                  </span>
                )}
                {typeFilter !== 'all' && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    種別: {typeFilter}
                  </span>
                )}
                {prefectureFilter !== 'all' && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    地域: {prefectureFilter}
                  </span>
                )}
                {!nameFilter && typeFilter === 'all' && prefectureFilter === 'all' && (
                  <span className="text-gray-500">すべての会員を表示中</span>
                )}
                <span className="text-gray-500 ml-auto">
                  検索結果: {filteredMembers.length}件
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-4 md:hidden">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.furigana}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-full" asChild>
                      <Link href={`/members/${member.id}`}>詳細</Link>
                    </Button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">種別：</span>
                      <div>
                        <span className="text-muted-foreground">種別：</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.types?.length 
                            ? member.types.map((type) => (
                                <span
                                  key={type}
                                  className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-xs font-medium"
                                >
                                  {type}
                                </span>
                              ))
                            : (
                                <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-xs font-medium">
                                  {member.type}
                                </span>
                              )
                          }
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">電話：</span>
                      <div className="mt-1 overflow-x-auto">
                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                          {member.phone ? member.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : member.phone}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">地域：</span>
                      <div className="mt-1">
                        <span className="inline-flex items-center justify-center rounded-md bg-accent/50 px-2 py-0.5 text-xs font-medium min-w-[80px] text-center">
                          {member.prefecture}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">郵便番号：</span>
                      <div className="mt-1">
                        {member.postalCode ? (
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium">
                            〒{member.postalCode}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">未登録</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">住所：</span>
                      <div className="mt-1">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium">
                          {member.address 
                            ? (member.address.startsWith(member.prefecture) 
                               ? member.address.substring(member.prefecture.length) 
                               : member.address)
                            : "未登録"}
                          {member.streetAddress && !member.address?.includes(member.streetAddress) && ` ${member.streetAddress}`}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">認定証番号：</span>
                      <div className="mt-1">
                        <span className="inline-flex items-center justify-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium min-w-[80px] text-center">
                          {formatCertificateNumber(member.number)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">名前 / ふりがな</TableHead>
                    <TableHead>種別</TableHead>
                    <TableHead>電話番号</TableHead>
                    <TableHead>都道府県</TableHead>
                    <TableHead>郵便番号</TableHead>
                    <TableHead>住所</TableHead>
                    <TableHead>認定証番号</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.furigana}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {member.types?.length 
                            ? member.types.map((type) => (
                                <span
                                  key={type}
                                  className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium"
                                >
                                  {type}
                                </span>
                              ))
                            : (
                                <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium">
                                  {member.type}
                                </span>
                              )
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="overflow-x-auto">
                          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                            {member.phone ? member.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : member.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center justify-center rounded-md bg-accent/50 px-2 py-0.5 text-xs font-medium min-w-[80px] text-center">
                          {member.prefecture}
                        </span>
                      </TableCell>
                      <TableCell>
                        {member.postalCode ? (
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium">
                            〒{member.postalCode}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">未登録</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium">
                            {member.address 
                              ? (member.address.startsWith(member.prefecture) 
                                 ? member.address.substring(member.prefecture.length) 
                                 : member.address)
                              : "未登録"}
                            {member.streetAddress && !member.address?.includes(member.streetAddress) && ` ${member.streetAddress}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center justify-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium min-w-[80px] text-center">
                          {formatCertificateNumber(member.number)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="rounded-full" asChild>
                          <Link href={`/members/${member.id}`}>詳細</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end mt-4">
              <PDFDownloadButton members={filteredMembers} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

