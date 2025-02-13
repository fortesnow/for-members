import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Metadata } from "next"

type PageParams = {
  id: string
}

export async function generateMetadata(
  { params }: { params: Promise<PageParams> }
): Promise<Metadata> {
  const resolvedParams = await params
  return {
    title: `会員詳細 - ${resolvedParams.id}`,
  }
}

export default async function MemberDetail(
  { params }: { params: Promise<PageParams> }
) {
  const resolvedParams = await params
  const { id } = resolvedParams

  // ここでメンバー情報の非同期取得も可能
  // const member = await fetchMember(id)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">会員詳細</h1>
        <Button asChild>
          <Link href={`/members/${id}/edit`}>編集</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>山田 太郎</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-gray-500">連絡先</dt>
              <dd>
                080-1234-5678
                <br />
                taro@example.com
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">会員種別</dt>
              <dd>正会員</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">登録番号</dt>
              <dd>M001</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">住所</dt>
              <dd>東京都渋谷区...</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium text-gray-500">備考</dt>
              <dd>特になし</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
