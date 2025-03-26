"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
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
import { db, auth } from "@/lib/firebase"
import { collection, query, orderBy, getDocs } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { Member } from "@/lib/db"
import { formatCertificateNumber } from "@/lib/db"
import { FirebaseError } from "firebase/app"

// ページごとに表示する会員数
const PAGE_SIZE = 20;

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [nameFilter, setNameFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [prefectureFilter, setPrefectureFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [displayMode, setDisplayMode] = useState<"paged" | "all">("paged")
  const { toast } = useToast()
  const router = useRouter()

  // ページネーションの計算
  const totalPages = Math.ceil(filteredMembers.length / PAGE_SIZE);
  
  // 現在のページに表示するメンバーを取得
  const getCurrentPageMembers = useCallback(() => {
    if (displayMode === "all") {
      return filteredMembers;
    }
    
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredMembers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredMembers, currentPage, displayMode]);
  
  // 現在のページのメンバー
  const displayedMembers = getCurrentPageMembers();

  // membersデータを取得する関数
  const fetchMembersData = useCallback(async () => {
    console.log("Fetching members data...")
    setIsLoading(true)

    if (!db) {
      console.error("Firestore is not initialized")
      setIsLoading(false)
      toast({
        title: "初期化エラー",
        description: "データベース接続が初期化されていません",
        variant: "destructive",
      })
      return
    }

    try {
      // 認証状態を確認
      if (!auth?.currentUser) {
        console.error("User is not authenticated")
        setIsLoading(false)
        toast({
          title: "認証エラー",
          description: "ログインしていないか、認証の有効期限が切れています",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      // 認証トークンを更新（期限切れトークンによるエラーを防止）
      await auth.currentUser.getIdToken(true)
      
      // 同期的に一度データを取得
      const membersRef = collection(db, "members")
      const q = query(membersRef, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        console.log("No members found in Firestore")
        setMembers([])
        setFilteredMembers([])
        setIsLoading(false)
        return
      }

      const memberData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Member[]

      console.log(`Fetched ${memberData.length} members successfully`)
      setMembers(memberData)
      setFilteredMembers(memberData)
      // ページを1ページ目に戻す
      setCurrentPage(1)
    } catch (error) {
      console.error("Error fetching members:", error)
      toast({
        title: "データ取得エラー",
        description: "会員データの取得中にエラーが発生しました",
        variant: "destructive",
      })
      // セキュリティルールに問題がある場合はRulesの更新を提案
      if (error instanceof FirebaseError && error.message.includes("permission")) {
        toast({
          title: "セキュリティルールエラー",
          description: "認証が有効でないか、アクセス権限がありません。もう一度ログインしてください。",
          variant: "destructive",
        })
        // 再ログインを促す
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    } finally {
      setIsLoading(false)
    }
  }, [toast, router]);

  // 認証状態を監視して、データを取得
  useEffect(() => {
    if (!auth || !db) {
      console.error("Firebase is not initialized properly")
      setIsLoading(false)
      return
    }

    console.log("Setting up authentication listener...")
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User is authenticated:", user.email)
        try {
          // 認証確認後にデータを取得
          await fetchMembersData()
        } catch (error) {
          console.error("Error after authentication:", error)
          toast({
            title: "データ取得エラー",
            description: "認証に成功しましたが、データの取得に失敗しました",
            variant: "destructive",
          })
          setIsLoading(false)
        }
      } else {
        console.log("User is not authenticated")
        setMembers([])
        setFilteredMembers([])
        setIsLoading(false)
        // 認証されていない場合、ログインページにリダイレクト
        toast({
          title: "認証エラー",
          description: "ログインが必要です",
          variant: "destructive",
        })
        router.push("/login")
      }
    })

    return () => {
      console.log("Cleanup auth listener")
      unsubscribeAuth()
    }
  }, [router, toast, fetchMembersData])

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
    // フィルタリングした後は1ページ目に戻す
    setCurrentPage(1)
  }, [nameFilter, typeFilter, prefectureFilter, members])

  // フィルター条件が変更されたら自動的にフィルタリングを実行
  useEffect(() => {
    handleFilter()
  }, [handleFilter])

  // ページを変更する関数
  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  // ディスプレイモードを切り替える関数
  const toggleDisplayMode = () => {
    setDisplayMode(prev => prev === "paged" ? "all" : "paged");
  };

  // 受講年月をフォーマットする関数を追加
  const formatEnrollmentDate = (enrollmentDate: string | undefined) => {
    if (!enrollmentDate) {
      return (
        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap">
          未設定
        </span>
      );
    }
    
    // YYYY年MM月形式から年と月を抽出
    const match = enrollmentDate.match(/(\d{4})年(\d{2})月/);
    if (!match) {
      return (
        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap">
          {enrollmentDate}
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap">
        {match[1]}年{match[2]}月
      </span>
    );
  };

  // ページネーションコントロールをレンダリングする関数
  const renderPagination = () => {
    if (totalPages <= 1 || displayMode === "all") return null;

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">前へ</span>
        </Button>
        
        <div className="flex items-center">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // 現在のページが中央に来るように表示するページ番号を計算
            let pageNum;
            if (totalPages <= 5) {
              // 全部で5ページ以下なら全部表示
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              // 現在のページが1-3なら1-5を表示
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              // 現在のページが後ろから3番目以内なら、末尾5ページを表示
              pageNum = totalPages - 4 + i;
            } else {
              // それ以外なら現在のページの前後2ページずつ表示
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => changePage(pageNum)}
                className={`h-8 w-8 p-0 ${currentPage === pageNum ? "bg-primary text-primary-foreground" : ""}`}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">次へ</span>
        </Button>
      </div>
    );
  };

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
                    <SelectItem value="ベビマ">ベビマ</SelectItem>
                    <SelectItem value="ベビーヨガ">ベビーヨガ</SelectItem>
                    <SelectItem value="ベビー発育">ベビー発育</SelectItem>
                    <SelectItem value="インストラクター">インストラクター</SelectItem>
                    <SelectItem value="マスター">マスター</SelectItem>
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
                
                {/* 表示モード切り替えボタン */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleDisplayMode}
                  className="ml-2"
                >
                  {displayMode === "paged" ? "全て表示" : "ページ表示"}
                </Button>
                
                {displayMode === "paged" && totalPages > 0 && (
                  <span className="text-gray-500 ml-2">
                    {currentPage} / {totalPages}ページ
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-4 md:hidden">
              {displayedMembers.map((member) => (
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
                      <span className="text-muted-foreground">担当講師：</span>
                      <div className="mt-1 overflow-x-auto">
                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                          {member.instructor || "未設定"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">受講年月：</span>
                      <div className="mt-1">
                        <div className="inline-flex items-center">
                          {formatEnrollmentDate(member.enrollmentDate)}
                        </div>
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
                    <TableHead>担当講師</TableHead>
                    <TableHead>受講年月</TableHead>
                    <TableHead>都道府県</TableHead>
                    <TableHead>認定証番号</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedMembers.map((member) => (
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
                            {member.instructor || "未設定"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center">
                          {formatEnrollmentDate(member.enrollmentDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center justify-center rounded-md bg-accent/50 px-2 py-0.5 text-xs font-medium min-w-[80px] text-center">
                          {member.prefecture}
                        </span>
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

            {/* ページネーションコントロール */}
            {renderPagination()}

            <div className="flex justify-end mt-4">
              <PDFDownloadButton members={filteredMembers} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}


