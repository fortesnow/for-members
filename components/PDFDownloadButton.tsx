"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

// Member型の定義
type Member = {
  id: number
  name: string
  furigana: string
  type: string
  phone: string
  prefecture: string
  number: string
}

export function PDFDownloadButton({ members }: { members: Member[] }) {
  const handleDownload = async () => {
    try {
      const { default: generatePDF } = await import('./MemberPDF')
      await generatePDF({ members })
    } catch (error) {
      console.error('PDF generation failed:', error)
    }
  }

  return (
    <Button 
      onClick={handleDownload}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      PDFダウンロード
    </Button>
  )
}

