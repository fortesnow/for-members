"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { getMember, updateMember, getInstructors } from "@/lib/db"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function EditMemberPage() {
  // useParamsフックを使用してルートパラメータにアクセス
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [postalCode, setPostalCode] = useState("")
  const [prefecture, setPrefecture] = useState("")
  const [city, setCity] = useState("")
  const [streetAddress, setStreetAddress] = useState("")
  const [instructors, setInstructors] = useState<Array<{id: string, name: string}>>([])
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    furigana: "",
    type: "",
    types: [] as string[],
    phone: "",
    number: "",
    email: "",
    notes: "",
    instructor: "",
    enrollmentDate: "",
  })

  // 電話番号入力時に自動的にハイフンを挿入する関数
  const formatPhoneNumber = (value: string): string => {
    // 数字以外の文字（ハイフンなど）を削除
    const numbers = value.replace(/[^\d]/g, '');
    
    // 11桁以上入力されないようにする
    if (numbers.length > 11) {
      return formData.phone;
    }
    
    // 電話番号のフォーマットを適用
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    }
  };

  // 電話番号入力のハンドラー
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formattedPhone });
  };

  // 会員データの取得
  useEffect(() => {
    async function fetchMember() {
      try {
        const member = await getMember(id)
        setFormData({
          name: member.name || "",
          furigana: member.furigana || "",
          type: member.type || "",
          types: member.types || (member.type ? [member.type] : []),
          phone: member.phone || "",
          number: member.number || "",
          email: member.email || "",
          notes: member.notes || "",
          instructor: member.instructor || "",
          enrollmentDate: member.enrollmentDate || "",
        })
        
        // 受講年月から年と月を抽出
        if (member.enrollmentDate) {
          const match = member.enrollmentDate.match(/(\d{4})年(\d{2})月/)
          if (match) {
            setSelectedYear(match[1])
            setSelectedMonth(match[2])
          } else {
            setSelectedYear("unset")
            setSelectedMonth("unset")
          }
        } else {
          setSelectedYear("unset")
          setSelectedMonth("unset")
        }
        
        setPostalCode(member.postalCode || "")
        setPrefecture(member.prefecture || "")
        
        // 住所と番地の重複チェック
        let cityAddress = member.address || "";
        const street = member.streetAddress || "";
        
        // 住所に番地情報が含まれている場合は除去する
        if (cityAddress && street && cityAddress.includes(street)) {
          const streetIndex = cityAddress.indexOf(street);
          if (streetIndex > 0) {
            cityAddress = cityAddress.substring(0, streetIndex).trim();
          }
        }
        
        setCity(cityAddress)
        setStreetAddress(street)
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

  // 講師リストの取得
  useEffect(() => {
    async function fetchInstructors() {
      try {
        const instructorsList = await getInstructors()
        setInstructors(instructorsList.map(instructor => ({
          id: instructor.id || '',
          name: instructor.name
        })))
      } catch (error) {
        console.error("Error fetching instructors:", error)
        toast({
          variant: "destructive",
          title: "エラー",
          description: "講師リストの取得に失敗しました",
        })
      }
    }
    
    fetchInstructors()
  }, [toast])

  // 郵便番号から住所を取得
  async function searchAddress(code: string) {
    if (code.length === 7) {
      try {
        const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${code}`)
        const data = await res.json()
        
        if (data.results && data.results.length > 0) {
          const address = data.results[0]
          
          // 都道府県を設定
          if (address.address1) {
            setPrefecture(address.address1)
          }
          
          // 市区町村部分を設定
          const address2 = address.address2 || "";
          const address3 = address.address3 || "";
          const cityPart = address2 + address3;
          
          // 市区町村をそのまま設定（番地の分離はしない）
          setCity(cityPart);
          
          console.log("郵便番号から取得した住所:", {
            prefecture: address.address1,
            city: cityPart
          });
        } else {
          console.log("郵便番号に該当する住所が見つかりませんでした");
        }
      } catch (error) {
        console.error("郵便番号検索エラー:", error);
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

  // 受講年月を更新する関数
  const updateEnrollmentDate = (year: string, month: string) => {
    if (year && year !== "unset" && month && month !== "unset") {
      const formattedDate = `${year}年${month}月`
      setFormData(prev => ({ ...prev, enrollmentDate: formattedDate }))
    } else {
      setFormData(prev => ({ ...prev, enrollmentDate: "" }))
    }
  }

  // 年を選択したときの処理
  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    updateEnrollmentDate(year, selectedMonth)
  }

  // 月を選択したときの処理
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
    updateEnrollmentDate(selectedYear, month)
  }

  // 年の選択肢を生成する（現在の年の前後10年）
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const startYear = currentYear - 10
    const endYear = currentYear + 10
    const years = []
    
    for (let year = startYear; year <= endYear; year++) {
      years.push(year.toString())
    }
    
    return years
  }

  // 月の選択肢を生成する
  const generateMonthOptions = () => {
    const months = []
    for (let month = 1; month <= 12; month++) {
      // 月を2桁で表示（例：01, 02, ..., 12）
      months.push(month.toString().padStart(2, '0'))
    }
    return months
  }

  async function handleSubmit(formData: FormData) {
    setIsSaving(true)
    try {
      // フォームからチェックボックスの値を取得
      const selectedTypes = Array.from(formData.getAll("types")) as string[];
      
      // 住所と番地の重複チェック
      let cityAddress = city;
      const street = streetAddress;
      
      // 市区町村に番地情報が含まれている場合は除去する
      if (cityAddress && street && cityAddress.includes(street)) {
        const streetIndex = cityAddress.indexOf(street);
        if (streetIndex > 0) {
          cityAddress = cityAddress.substring(0, streetIndex).trim();
        }
      }
      
      const member = {
        name: formData.get("name") as string,
        furigana: formData.get("furigana") as string,
        types: selectedTypes,
        // 後方互換性のために最初の選択を単一のtypeフィールドにも設定
        type: selectedTypes.length > 0 ? selectedTypes[0] : "",
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        prefecture: prefecture,
        postalCode: postalCode,
        address: cityAddress,
        streetAddress: street,
        number: formData.get("number") as string,
        notes: formData.get("notes") as string,
        instructor: formData.get("instructor") as string,
        enrollmentDate: formData.get("enrollmentDate") as string,
      }

      await updateMember(id, member)
      toast({
        title: "成功",
        description: "会員情報を更新しました",
      })
      router.push(`/members/${id}`)
      router.refresh()
    } catch {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "会員情報の更新に失敗しました",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>会員情報編集</CardTitle>
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
                      id="type-bebima"
                      name="types"
                      value="ベビマ"
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      checked={formData.types.includes("ベビマ")}
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
                    <Label htmlFor="type-bebima" className="text-sm">
                      ベビマ
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="type-bebee-yoga"
                      name="types"
                      value="ベビーヨガ"
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      checked={formData.types.includes("ベビーヨガ")}
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
                    <Label htmlFor="type-bebee-yoga" className="text-sm">
                      ベビーヨガ
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="type-bebee-hatsuiku"
                      name="types"
                      value="ベビー発育"
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      checked={formData.types.includes("ベビー発育")}
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
                    <Label htmlFor="type-bebee-hatsuiku" className="text-sm">
                      ベビー発育
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="type-instructor"
                      name="types"
                      value="インストラクター"
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      checked={formData.types.includes("インストラクター")}
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
                    <Label htmlFor="type-instructor" className="text-sm">
                      インストラクター
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="type-master"
                      name="types"
                      value="マスター"
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      checked={formData.types.includes("マスター")}
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
                    <Label htmlFor="type-master" className="text-sm">
                      マスター
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
                    onChange={handlePhoneChange}
                    placeholder="例：090-1234-5678"
                    className="rounded-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number" className="text-sm font-medium">
                    登録番号
                  </Label>
                  <Input
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="例：A12345"
                    className="rounded-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="例：example@mail.com"
                  className="rounded-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-sm font-medium">
                  郵便番号
                </Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={handlePostalCodeChange}
                  placeholder="例：1234567（ハイフンなし）"
                  className="rounded-full"
                  maxLength={7}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prefecture" className="text-sm font-medium">
                    都道府県
                  </Label>
                  <Input
                    id="prefecture"
                    value={prefecture}
                    onChange={(e) => setPrefecture(e.target.value)}
                    placeholder="例：東京都"
                    className="rounded-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    市区町村
                  </Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="例：千代田区"
                    className="rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="streetAddress" className="text-sm font-medium">
                  番地・建物名
                </Label>
                <Input
                  id="streetAddress"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="例：1-1-1 マンション101"
                  className="rounded-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  備考
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="備考欄"
                  className="rounded-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instructor" className="text-sm font-medium">
                    担当講師
                  </Label>
                  <Select
                    value={formData.instructor || "unset"}
                    onValueChange={(value) => setFormData({ ...formData, instructor: value === "unset" ? "" : value })}
                  >
                    <SelectTrigger className="w-full rounded-full">
                      <SelectValue placeholder="担当講師を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unset">未設定</SelectItem>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.name}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enrollmentDate" className="text-sm font-medium">
                    受講年月
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedYear}
                      onValueChange={handleYearChange}
                    >
                      <SelectTrigger className="rounded-full w-24">
                        <SelectValue placeholder="年" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unset">未選択</SelectItem>
                        {generateYearOptions().map(year => (
                          <SelectItem key={year} value={year}>
                            {year}年
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedMonth}
                      onValueChange={handleMonthChange}
                    >
                      <SelectTrigger className="rounded-full w-24">
                        <SelectValue placeholder="月" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unset">未選択</SelectItem>
                        {generateMonthOptions().map(month => (
                          <SelectItem key={month} value={month}>
                            {month}月
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    id="enrollmentDate"
                    name="enrollmentDate"
                    value={formData.enrollmentDate}
                    type="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                className="rounded-full"
              >
                キャンセル
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
                className="rounded-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  "保存"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 