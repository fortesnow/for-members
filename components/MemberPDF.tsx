"use client"

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

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

const MemberPDF = ({ members }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>会員一覧</Text>
      <View style={styles.table}>
        {/* テーブルヘッダー */}
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>氏名</Text>
          <Text style={styles.tableCell}>メールアドレス</Text>
          <Text style={styles.tableCell}>電話番号</Text>
        </View>
        {/* メンバーデータ */}
        {members.map((member, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{member.name}</Text>
            <Text style={styles.tableCell}>{member.email}</Text>
            <Text style={styles.tableCell}>{member.phone}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
)

export default MemberPDF

