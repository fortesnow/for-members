// MemberDetailClient.tsxファイルを新たに作成し、クライアントコンポーネントを移動させることをお勧めします

// サーバーコンポーネント - "use client"ディレクティブなし
import MemberDetailClient from "./MemberDetailClient"
import { Metadata } from 'next'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `会員詳細 - ${params.id}`,
  }
}

// ページコンポーネント（サーバーコンポーネント）
export default async function MemberDetailPage({ params }: Props) {
  return <MemberDetailClient id={params.id} />;
}
