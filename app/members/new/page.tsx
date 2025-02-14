"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { addMember } from "@/lib/db"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export default function NewMemberPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    furigana: "",
    type: "",
    phone: "",
    prefecture: "",
    number: "",
  })

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await addMember(formData)
      toast({
        title: "成功",
        description: "会員を追加しました",
      })
      router.push("/members")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error instanceof Error ? error.message : "会員の追加に失敗しました",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-primary text-center">新規会員登録</h1>

      <Card>
        <CardContent className="p-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    お名前（漢字）
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例：山田 花子"
                    className="rounded-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="furigana" className="text-sm font-medium">
                    ふりがな
                  </Label>
                  <Input
                    id="furigana"
                    name="furigana"
                    value={formData.furigana}
                    onChange={(e) => setFormData({ ...formData, furigana: e.target.value })}
                    placeholder="例：やまだ はなこ"
                    className="rounded-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">
                  資格種別
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type" className="rounded-full">
                    <SelectValue placeholder="資格を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ベビーマッサージマスター">ベビーマッサージマスター</SelectItem>
                    <SelectItem value="ベビーヨガマスター">ベビーヨガマスター</SelectItem>
                    <SelectItem value="ベビーマッサージインストラクター">ベビーマッサージインストラクター</SelectItem>
                    <SelectItem value="ベビーヨガインストラクター">ベビーヨガインストラクター</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    電話番号
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="例：090-1234-5678"
                    className="rounded-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prefecture" className="text-sm font-medium">
                    都道府県
                  </Label>
                  <Select
                    value={formData.prefecture}
                    onValueChange={(value) => setFormData({ ...formData, prefecture: value })}
                  >
                    <SelectTrigger id="prefecture" className="rounded-full">
                      <SelectValue placeholder="都道府県を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="大阪府">大阪府</SelectItem>
                      <SelectItem value="京都府">京都府</SelectItem>
                      <SelectItem value="東京都">東京都</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="number" className="text-sm font-medium">
                  会員番号
                </Label>
                <Input
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="例：23-00001"
                  className="rounded-full"
                  required
                />
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button type="submit" className="rounded-full px-8" disabled={isLoading}>
                {isLoading ? "登録中..." : "登録する"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

