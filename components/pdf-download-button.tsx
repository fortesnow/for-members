"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Printer } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Member as DBMember } from "@/lib/db"

type Member = {
  id?: string
  name: string
  furigana: string
  type?: string
  types?: string[]
  phone: string
  prefecture: string
  address?: string
  number: string
}

interface PDFDownloadButtonProps {
  members: (Member | DBMember)[]
}

export function PDFDownloadButton({ members }: PDFDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePrint = () => {
    setIsLoading(true)
    
    try {
      // 印刷用のiframeを作成
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'absolute';
      printFrame.style.top = '-9999px';
      printFrame.style.left = '-9999px';
      document.body.appendChild(printFrame);
      
      // 現在の日付を取得
      const today = new Date();
      const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
      
      // HTML内容を作成
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>会員リスト</title>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Arial", sans-serif;
              margin: 20px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .date {
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              background-color: #FB923C;
              color: white;
              padding: 8px;
              text-align: left;
              font-weight: bold;
              font-size: 14px;
            }
            td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
              font-size: 14px;
            }
            tr:nth-child(even) {
              background-color: #FBF5E4;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>会員リスト</h1>
            <p class="date">出力日: ${dateStr}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>会員番号</th>
                <th>名前</th>
                <th>ふりがな</th>
                <th>種別</th>
                <th>電話番号</th>
                <th>都道府県</th>
                <th>住所</th>
              </tr>
            </thead>
            <tbody>
              ${members.map(member => `
                <tr>
                  <td>${member.number}</td>
                  <td>${member.name}</td>
                  <td>${member.furigana}</td>
                  <td>${member.types?.length ? member.types.join(", ") : (member.type || '')}</td>
                  <td>${member.phone}</td>
                  <td>${member.prefecture}</td>
                  <td>${member.address || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      
      // iframeにHTMLを書き込む
      const contentWindow = printFrame.contentWindow;
      if (contentWindow) {
        const frameDoc = contentWindow.document;
        frameDoc.open();
        frameDoc.write(html);
        frameDoc.close();
        
        // iframe読み込み完了後に印刷
        printFrame.onload = () => {
          try {
            if (contentWindow) {
              contentWindow.focus();
              contentWindow.print();
              
              // 印刷ダイアログが閉じられた後にiframeを削除
              setTimeout(() => {
                document.body.removeChild(printFrame);
                setIsLoading(false);
                
                toast({
                  title: "印刷準備完了",
                  description: "印刷ダイアログが表示されました",
                });
              }, 1000);
            }
          } catch (error) {
            console.error("印刷エラー:", error);
            document.body.removeChild(printFrame);
            setIsLoading(false);
            
            toast({
              variant: "destructive",
              title: "エラー",
              description: "印刷の準備に失敗しました",
            });
          }
        };
      } else {
        // contentWindowが存在しない場合
        document.body.removeChild(printFrame);
        throw new Error("印刷用フレームの初期化に失敗しました");
      }
    } catch (error) {
      console.error("印刷エラー:", error);
      setIsLoading(false);
      
      toast({
        variant: "destructive",
        title: "エラー",
        description: "印刷の準備に失敗しました",
      });
    }
  };

  return (
    <Button 
      onClick={handlePrint}
      variant="outline"
      size="sm"
      className="gap-2"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          準備中...
        </>
      ) : (
        <>
          <Printer className="h-4 w-4" />
          印刷/PDF出力
        </>
      )}
    </Button>
  )
} 