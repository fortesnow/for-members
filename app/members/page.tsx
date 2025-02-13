"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { PDFDownloadButton } from "@/components/PDFDownloadButton"

// 仮のメンバーデータ
const members = [
  {
    id: 1,
    name: "小松 沙緒里",
    furigana: "こまつ さおり",
    type: "ベビーマッサージマスター",
    phone: "090-1234-5678",
    prefecture: "大阪府",
    number: "19-00002",
  },
  {
    id: 2,
    name: "山田 花子",
    furigana: "やまだ はなこ",
    type: "ベビーヨガインストラクター",
    phone: "080-9876-5432",
    prefecture: "東京都",
    number: "20-00001",
  },
  // 他のメンバーデータ...
]

export default function MemberList() {
  const [filteredMembers, setFilteredMembers] = useState(members)
  const [nameFilter, setNameFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [prefectureFilter, setPrefectureFilter] = useState("all")

  const handleFilter = () => {
    const filtered = members.filter(
      (member) =>
        (nameFilter === "" || member.name.includes(nameFilter) || member.furigana.includes(nameFilter)) &&
        (typeFilter === "all" || member.type === typeFilter) &&
        (prefectureFilter === "all" || member.prefecture === prefectureFilter),
    )
    setFilteredMembers(filtered)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">会員リスト</h1>
        <Button className="rounded-full" asChild>
          <Link href="/members/new">
            <span className="px-2">＋ 新規会員登録</span>
          </Link>
        </Button>
      </div>

      <div className="p-6 bg-white rounded-xl shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              className="pl-10 rounded-full"
              placeholder="名前やふりがなで検索..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="rounded-full">
              <SelectValue placeholder="資格種別で絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全て</SelectItem>
              <SelectItem value="ベビーマッサージマスター">ベビーマッサージマスター</SelectItem>
              <SelectItem value="ベビーヨガマスター">ベビーヨガマスター</SelectItem>
              <SelectItem value="ベビーマッサージインストラクター">ベビーマッサージインストラクター</SelectItem>
              <SelectItem value="ベビーヨガインストラクター">ベビーヨガインストラクター</SelectItem>
            </SelectContent>
          </Select>
          <Select value={prefectureFilter} onValueChange={setPrefectureFilter}>
            <SelectTrigger className="rounded-full">
              <SelectValue placeholder="都道府県で絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全て</SelectItem>
              <SelectItem value="大阪府">大阪府</SelectItem>
              <SelectItem value="東京都">東京都</SelectItem>
              {/* 他の都道府県... */}
            </SelectContent>
          </Select>
          <Button onClick={handleFilter} className="rounded-full">
            絞り込み
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">名前 / ふりがな</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>電話番号</TableHead>
                <TableHead>都道府県</TableHead>
                <TableHead>番号</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.furigana}</div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-sm font-medium">
                      {member.type}
                    </span>
                  </TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{member.prefecture}</TableCell>
                  <TableCell>{member.number}</TableCell>
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
      </div>
    </div>
  )
}

