"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { deleteMember } from "@/lib/db"
import { Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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
}

export default function MemberDetail({ params }: { params: { id: string } }) {
  const { id } = params
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
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
          setMember({
            id: docSnap.id,
            ...docSnap.data(),
          } as Member)
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
              <dd>
                {member.phone}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">会員種別</dt>
              <dd>
                {member.types?.length 
                  ? member.types.map((type) => (
                      <span 
                        key={type} 
                        className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-sm font-medium mr-2 mb-1"
                      >
                        {type}
                      </span>
                    ))
                  : member.type}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">登録番号</dt>
              <dd>{member.number}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">都道府県</dt>
              <dd>{member.prefecture}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-gray-500">住所</dt>
              <dd>{member.address}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
