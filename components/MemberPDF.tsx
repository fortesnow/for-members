"use client"

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatCertificateNumber } from '@/lib/db'

type Member = {
  id: number
  name: string
  furigana: string
  type: string
  phone: string
  prefecture: string
  number: string
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid'
  },
  tableCell: {
    padding: 5,
    borderRightWidth: 1,
    borderRightStyle: 'solid'
  }
})

const MemberPDF = ({ members }: { members: Member[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>会員一覧</Text>
      <View style={styles.table}>
        {/* テーブルヘッダー */}
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>氏名</Text>
          <Text style={styles.tableCell}>種別</Text>
          <Text style={styles.tableCell}>電話番号</Text>
          <Text style={styles.tableCell}>都道府県</Text>
          <Text style={styles.tableCell}>認定証番号</Text>
        </View>
        {/* メンバーデータ */}
        {members.map((member, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{member.name}</Text>
            <Text style={styles.tableCell}>{member.type}</Text>
            <Text style={styles.tableCell}>{member.phone}</Text>
            <Text style={styles.tableCell}>{member.prefecture}</Text>
            <Text style={styles.tableCell}>{formatCertificateNumber(member.number)}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
)

export default MemberPDF

