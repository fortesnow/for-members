"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export default function NewMember() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-primary text-center">新規会員登録</h1>

      <Card>
        <CardContent className="p-6">
          <form className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    お名前（漢字）
                  </Label>
                  <Input id="name" placeholder="例：山田 花子" className="rounded-full" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="furigana" className="text-sm font-medium">
                    ふりがな
                  </Label>
                  <Input id="furigana" placeholder="例：やまだ はなこ" className="rounded-full" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualification" className="text-sm font-medium">
                  資格種別
                </Label>
                <Select>
                  <SelectTrigger id="qualification" className="rounded-full">
                    <SelectValue placeholder="資格を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="massage-master">ベビーマッサージマスター</SelectItem>
                    <SelectItem value="yoga-master">ベビーヨガマスター</SelectItem>
                    <SelectItem value="massage-instructor">ベビーマッサージインストラクター</SelectItem>
                    <SelectItem value="yoga-instructor">ベビーヨガインストラクター</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    電話番号
                  </Label>
                  <Input id="phone" placeholder="例：090-1234-5678" className="rounded-full" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prefecture" className="text-sm font-medium">
                    都道府県
                  </Label>
                  <Select>
                    <SelectTrigger id="prefecture" className="rounded-full">
                      <SelectValue placeholder="都道府県を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="osaka">大阪府</SelectItem>
                      <SelectItem value="kyoto">京都府</SelectItem>
                      <SelectItem value="tokyo">東京都</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button type="submit" className="rounded-full px-8">
                登録する
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

