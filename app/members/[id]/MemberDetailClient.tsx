"use client"

import { useState, useEffect } from "react"
import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { deleteMember, updateMember } from "@/lib/db"
import { formatCertificateNumber } from "@/lib/db"
import { Loader2, Trash2, BookOpen, Save, MapPin } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// 簡易版のアラートダイアログ（Radixなしで実装）
function AlertDialogSimple({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = "確認", 
  cancelText = "キャンセル" 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-500 mb-6">{description}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

type Member = {
  id: string
  name: string
  furigana: string
  type?: string
  types?: string[]
  phone: string
  prefecture: string
  address?: string
  number: string
  streetAddress?: string
  isInstructor?: boolean
  instructorDetails?: {
    specialties?: string[]
    experience?: number
    bio?: string
  }
  postalCode?: string
  email?: string
  notes?: string
}

// 住所から郵便番号を取得する関数
async function fetchPostalCode(address: string): Promise<string | null> {
  try {
    // 都道府県名を削除（APIの精度を上げるため）
    const prefectures = [
      "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
      "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
      "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
      "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
      "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
      "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
      "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
    ];
    
    let searchAddress = address;
    for (const pref of prefectures) {
      if (address.startsWith(pref)) {
        searchAddress = address.substring(pref.length);
        break;
      }
    }
    
    // 数字のみを抽出（番地など）
    const numbers = searchAddress.match(/\d+/g);
    if (!numbers || numbers.length === 0) {
      return null;
    }
    
    // APIにリクエスト
    const response = await fetch(
      `https://zipcloud.ibsnet.co.jp/api/search?address=${encodeURIComponent(searchAddress)}`
    );
    const data = await response.json();
    
    if (data.status === 200 && data.results && data.results.length > 0) {
      // 最初の結果を使用
      return data.results[0].zipcode;
    }
    return null;
  } catch (error) {
    console.error("郵便番号の取得に失敗しました:", error);
    return null;
  }
}

// クライアントコンポーネント
export default function MemberDetailClient({ id }: { id: string }) {
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isInstructor, setIsInstructor] = useState(false)
  const [specialties, setSpecialties] = useState<string>("")
  const [experience, setExperience] = useState<string>("")
  const [bio, setBio] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingPostalCode, setIsUpdatingPostalCode] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchMember() {
      setIsLoading(true)
      try {
        if (!db) throw new Error("Firestore is not initialized")
        
        const docRef = doc(db, "members", id)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const memberData = {
            id: docSnap.id,
            ...docSnap.data(),
          } as Member
          
          setMember(memberData)
          setIsInstructor(memberData.isInstructor || false)
          setSpecialties(memberData.instructorDetails?.specialties?.join(', ') || "")
          setExperience(memberData.instructorDetails?.experience?.toString() || "")
          setBio(memberData.instructorDetails?.bio || "")
        } else {
          setMember(null)
        }
      } catch (error) {
        console.error("Error fetching member:", error)
        toast({
          variant: "destructive",
          title: "エラー",
          description: "会員情報の取得に失敗しました",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMember()
  }, [id, toast])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMember(id)
      toast({
        title: "成功",
        description: "会員を削除しました",
      })
      router.push("/members")
    } catch (error) {
      console.error("Error deleting member:", error)
      toast({
        variant: "destructive",
        title: "エラー",
        description: "会員の削除に失敗しました",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleInstructorToggle = (checked: boolean) => {
    setIsInstructor(checked);
  }

  const saveInstructorDetails = async () => {
    if (!member) return;
    
    setIsSaving(true);
    try {
      const specialtiesArray = specialties
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s !== '');
      
      await updateMember(id, {
        isInstructor,
        instructorDetails: isInstructor ? {
          specialties: specialtiesArray,
          experience: experience ? parseInt(experience) : undefined,
          bio: bio || undefined
        } : undefined
      });
      
      toast({
        title: "成功",
        description: "講師情報を更新しました",
      });
      
      // 更新後のメンバー情報を反映
      setMember({
        ...member,
        isInstructor,
        instructorDetails: isInstructor ? {
          specialties: specialtiesArray,
          experience: experience ? parseInt(experience) : undefined,
          bio: bio || undefined
        } : undefined
      });
      
    } catch (error) {
      console.error("Error updating instructor details:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "講師情報の更新に失敗しました",
      });
    } finally {
      setIsSaving(false);
    }
  }

  // 郵便番号を更新する関数
  const updatePostalCode = async () => {
    if (!member?.address) return;
    
    setIsUpdatingPostalCode(true);
    try {
      const postalCode = await fetchPostalCode(member.address);
      
      if (postalCode && db) {
        // Firestoreのデータを更新
        const memberRef = doc(db, "members", id);
        await updateDoc(memberRef, {
          postalCode: postalCode
        });
        
        // メンバーステートを更新
        setMember({
          ...member,
          postalCode: postalCode
        });
        
        toast({
          title: "成功",
          description: `郵便番号を更新しました: ${postalCode}`,
        });
      } else if (!postalCode) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: `住所「${member.address}」から郵便番号を取得できませんでした`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "Firestoreが初期化されていません",
        });
      }
    } catch (error) {
      console.error("郵便番号の更新に失敗しました:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "郵便番号の更新に失敗しました",
      });
    } finally {
      setIsUpdatingPostalCode(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">会員が見つかりません</h1>
        <Button asChild>
          <Link href="/members">会員一覧に戻る</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">会員詳細</h1>
        <div className="flex gap-2 sm:gap-4">
          <Button className="flex-1 sm:flex-none" asChild>
            <Link href={`/members/${id}/edit`}>編集</Link>
          </Button>
          
          <Button 
            variant="destructive" 
            className="flex-1 sm:flex-none" 
            disabled={isDeleting}
            onClick={() => setShowDeleteDialog(true)}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                処理中...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                削除
              </>
            )}
          </Button>

          <AlertDialogSimple
            isOpen={showDeleteDialog}
            onClose={() => setShowDeleteDialog(false)}
            onConfirm={handleDelete}
            title="会員を削除しますか？"
            description={`この操作は取り消せません。${member.name}さんの会員情報がすべて削除されます。`}
            confirmText="削除する"
            cancelText="キャンセル"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">{member.name}</CardTitle>
          <p className="text-md text-muted-foreground">{member.furigana}</p>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-gray-500">連絡先</dt>
              <dd className="mt-2 overflow-x-auto">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-sm font-medium tracking-wider whitespace-nowrap">
                  {member.phone ? member.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : member.phone}
                </span>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">メールアドレス</dt>
              <dd className="mt-2 overflow-x-auto">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-sm font-medium tracking-wider whitespace-nowrap">
                  {member.email || "未登録"}
                </span>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">会員種別</dt>
              <dd className="flex flex-wrap gap-2 mt-2">
                {member.types?.length 
                  ? member.types.map((type) => (
                      <span 
                        key={type} 
                        className="inline-flex items-center rounded-full bg-accent/70 px-3 py-1 text-sm font-medium border border-primary/20 shadow-sm"
                      >
                        {type}
                      </span>
                    ))
                  : (
                      <span 
                        className="inline-flex items-center rounded-full bg-accent/70 px-3 py-1 text-sm font-medium border border-primary/20 shadow-sm"
                      >
                        {member.type}
                      </span>
                    )
                }
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">備考</dt>
              <dd className="mt-2">
                {member.notes ? (
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-medium">
                    {member.notes}
                  </span>
                ) : (
                  <span className="text-gray-400">未登録</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">認定証番号</dt>
              <dd className="mt-2">
                <span className="inline-flex items-center justify-center rounded-md bg-secondary px-3 py-1 text-sm font-medium min-w-[100px] text-center">
                  {formatCertificateNumber(member.number)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">都道府県</dt>
              <dd className="mt-2">
                <span className="inline-flex items-center justify-center rounded-md bg-accent/50 px-3 py-1 text-sm font-medium min-w-[100px] text-center">
                  {member.prefecture}
                </span>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">郵便番号</dt>
              <dd className="mt-2">
                {member.postalCode ? (
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-medium">
                    〒{member.postalCode}
                  </span>
                ) : member.address ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={updatePostalCode}
                    disabled={isUpdatingPostalCode}
                  >
                    {isUpdatingPostalCode ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <MapPin className="h-4 w-4 mr-1" />
                    )}
                    郵便番号を取得
                  </Button>
                ) : (
                  <span className="text-gray-400">未登録</span>
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-gray-500">住所</dt>
              <dd className="mt-2">
                {member.prefecture || member.address || member.streetAddress ? (
                  <div className="flex flex-wrap gap-1 items-center">
                    {member.prefecture && (
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-medium">
                        {member.prefecture}
                      </span>
                    )}
                    {member.address && (
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-medium">
                        {member.address.startsWith(member.prefecture) 
                          ? member.address.substring(member.prefecture.length) 
                          : member.address}
                      </span>
                    )}
                    {member.streetAddress && !member.address?.includes(member.streetAddress) && (
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-medium">
                        {member.streetAddress}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400">未登録</span>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* 講師設定セクション */}
      <Card>
        <CardHeader className="bg-accent/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary text-lg flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              講師設定
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Switch 
                id="instructor-mode"
                checked={isInstructor}
                onCheckedChange={handleInstructorToggle}
              />
              <Label htmlFor="instructor-mode">
                {isInstructor ? "講師" : "一般会員"}
              </Label>
            </div>
          </div>
        </CardHeader>
        
        {isInstructor && (
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialties">専門分野（カンマ区切りで複数入力可）</Label>
              <Input
                id="specialties"
                placeholder="マッサージ, 整体, リラクゼーション"
                value={specialties}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSpecialties(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience">経験年数</Label>
              <Input
                id="experience"
                type="number"
                placeholder="5"
                value={experience}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExperience(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">自己紹介・経歴</Label>
              <Textarea
                id="bio"
                placeholder="経歴や得意分野、資格などを入力してください"
                value={bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                rows={4}
              />
            </div>
            
            <Button 
              onClick={saveInstructorDetails} 
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  講師情報を保存
                </>
              )}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
} 