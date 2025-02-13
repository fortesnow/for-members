"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
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
import { members } from "@/data/members"

export default function MemberList() {
  const [filteredMembers, setFilteredMembers] = useState(members)
  const [nameFilter, setNameFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [prefectureFilter, setPrefectureFilter] = useState("all")

  const handleFilter = () => {
    const filtered = members.filter(
      (member) =>
        (nameFilter === "" || 
         member.name.includes(nameFilter) || 
         member.furigana.includes(nameFilter)) &&
        (typeFilter === "all" || member.type === typeFilter) &&
        (prefectureFilter === "all" || member.prefecture === prefectureFilter),
    )
    setFilteredMembers(filtered)
  }

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
        <div className="grid gap-3 md:grid-cols-4 md:gap-4">
          <div className="relative col-span-full md:col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="名前やふりがなで検索..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="資格種別で絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全て</SelectItem>
              <SelectItem value="ベビーマッサージマスター">ベビーマッサージマスター</SelectItem>
              <SelectItem value="ベビーヨガインストラクター">ベビーヨガインストラクター</SelectItem>
            </SelectContent>
          </Select>
          <Select value={prefectureFilter} onValueChange={setPrefectureFilter}>
            <SelectTrigger>
              <SelectValue placeholder="都道府県で絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全て</SelectItem>
              <SelectItem value="大阪府">大阪府</SelectItem>
              <SelectItem value="東京都">東京都</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleFilter}>
            絞り込み
          </Button>
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
                  <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-xs font-medium">
                    {member.type}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">電話：</span>
                  {member.phone}
                </div>
                <div>
                  <span className="text-muted-foreground">地域：</span>
                  {member.prefecture}
                </div>
                <div>
                  <span className="text-muted-foreground">番号：</span>
                  {member.number}
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
                <TableHead>番号</TableHead>
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

