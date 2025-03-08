"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { addMember } from "@/lib/db"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function NewMemberPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [postalCode, setPostalCode] = useState("")
  const [prefecture, setPrefecture] = useState("")
  const [city, setCity] = useState("")
  const [streetAddress, setStreetAddress] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    furigana: "",
    type: "",
    types: [] as string[],
    phone: "",
    number: "",
  })

  // 郵便番号から住所を取得
  async function searchAddress(code: string) {
    if (code.length === 7) {
      try {
        const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${code}`)
        const data = await res.json()
        if (data.results) {
          const address = data.results[0]
          setPrefecture(address.address1)
          setCity(address.address2 + address.address3)
        }
      } catch {
        console.error("郵便番号検索エラー")
      }
    }
  }

  // 郵便番号入力時の処理
  function handlePostalCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/[^0-9]/g, "")
    setPostalCode(value)
    if (value.length === 7) {
      searchAddress(value)
    }
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      // フォームからチェックボックスの値を取得
      const selectedTypes = Array.from(formData.getAll("types")) as string[];
      
      const member = {
        name: formData.get("name") as string,
        furigana: formData.get("furigana") as string,
        types: selectedTypes,
        // 後方互換性のために最初の選択を単一のtypeフィールドにも設定
        type: selectedTypes.length > 0 ? selectedTypes[0] : "",
        phone: formData.get("phone") as string,
        prefecture: prefecture,
        postalCode: postalCode,
        address: city,
        streetAddress: streetAddress,
        number: formData.get("number") as string,
        email: "",
        notes: "",
      }

      await addMember(member)
      toast({
        title: "成功",
        description: "会員を登録しました",
      })
      router.push("/members")
      router.refresh()
    } catch {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "会員の登録に失敗しました",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>新規会員登録</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
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
                <Label className="text-sm font-medium">
                  資格種別（複数選択可）
                </Label>
                <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="type-master-massage"
                      name="types"
                      value="ベビーマッサージマスター"
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      checked={formData.types.includes("ベビーマッサージマスター")}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => {
                          const types = e.target.checked 
                            ? [...prev.types, value] 
                            : prev.types.filter(t => t !== value);
                          return { ...prev, types };
                        });
                      }}
                    />
                    <Label htmlFor="type-master-massage" className="text-sm">
                      ベビーマッサージマスター
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="type-master-yoga"
                      name="types"
                      value="ベビーヨガマスター"
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      checked={formData.types.includes("ベビーヨガマスター")}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => {
                          const types = e.target.checked 
                            ? [...prev.types, value] 
                            : prev.types.filter(t => t !== value);
                          return { ...prev, types };
                        });
                      }}
                    />
                    <Label htmlFor="type-master-yoga" className="text-sm">
                      ベビーヨガマスター
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="type-instructor-massage"
                      name="types"
                      value="ベビーマッサージインストラクター"
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      checked={formData.types.includes("ベビーマッサージインストラクター")}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => {
                          const types = e.target.checked 
                            ? [...prev.types, value] 
                            : prev.types.filter(t => t !== value);
                          return { ...prev, types };
                        });
                      }}
                    />
                    <Label htmlFor="type-instructor-massage" className="text-sm">
                      ベビーマッサージインストラクター
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="type-instructor-yoga"
                      name="types"
                      value="ベビーヨガインストラクター"
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      checked={formData.types.includes("ベビーヨガインストラクター")}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => {
                          const types = e.target.checked 
                            ? [...prev.types, value] 
                            : prev.types.filter(t => t !== value);
                          return { ...prev, types };
                        });
                      }}
                    />
                    <Label htmlFor="type-instructor-yoga" className="text-sm">
                      ベビーヨガインストラクター
                    </Label>
                  </div>
                </div>
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
                  <Label htmlFor="postalCode">郵便番号</Label>
                  <Input
                    id="postalCode"
                    value={postalCode}
                    onChange={handlePostalCodeChange}
                    placeholder="1234567"
                    maxLength={7}
                    className="w-32"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prefecture">都道府県</Label>
                <Input
                  id="prefecture"
                  value={prefecture}
                  onChange={(e) => setPrefecture(e.target.value)}
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">市区町村</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="streetAddress">番地・建物名</Label>
                <Input
                  id="streetAddress"
                  name="streetAddress"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="1-2-3 ○○マンション101"
                />
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登録中...
                  </>
                ) : (
                  "登録する"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

