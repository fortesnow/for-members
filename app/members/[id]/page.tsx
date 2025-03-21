// MemberDetailClient.tsxファイルを新たに作成し、クライアントコンポーネントを移動させることをお勧めします

// サーバーコンポーネント - "use client"ディレクティブなし
import MemberDetailClient from "./MemberDetailClient"
import { Metadata } from 'next'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // paramsオブジェクト自体をawaitする必要はありませんが、
  // 必要に応じてここでidに基づいたデータ取得処理をawaitすることも可能です
  const id = params.id;
  return {
    title: `会員詳細 - ${id}`,
  }
}

// ページコンポーネント（サーバーコンポーネント）
export default async function MemberDetailPage({ params }: Props) {
  // paramsからidを取得して使用
  const id = params.id;
  return <MemberDetailClient id={id} />;
}
