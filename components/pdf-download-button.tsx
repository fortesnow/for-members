"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

type Member = {
  id: number
  name: string
  furigana: string
  type: string
  phone: string
  prefecture: string
  number: string
}

interface PDFDownloadButtonProps {
  members: Member[]
}

export function PDFDownloadButton({ members }: PDFDownloadButtonProps) {
  const handleDownload = () => {
    // PDFダウンロードの実装
    // 実際のアプリケーションでは、PDFライブラリを使用して実装します
    console.log("Downloading PDF for", members)
    alert("PDF出力機能は準備中です")
  }

  return (
    <Button 
      onClick={handleDownload}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      PDF出力
    </Button>
  )
} 