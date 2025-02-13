"use client"

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

// PDFコンポーネントを動的にインポート
const MemberPDF = dynamic(() => import('./MemberPDF'), {
  ssr: false,
  loading: () => <p>Loading...</p>
})

export function PDFDownloadButton({ members }) {
  return (
    <Button 
      onClick={() => {
        // PDFダウンロードロジック
      }}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      PDFダウンロード
    </Button>
  )
}

