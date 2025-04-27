// components/PDFReportDocument.js

import {
  Page,
  Document,
  StyleSheet,
  View,
  Text,
  Image,
} from "@react-pdf/renderer";
import dayjs from "dayjs";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 150,
    fontSize: 12,
    fontWeight: "bold",
  },
  value: {
    fontSize: 12,
  },
  table: {
    width: "100%",
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 5,
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    fontWeight: "bold",
  },
  tableCol: {
    padding: 5,
    width: "33%",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginBottom: 10,
  },
  statusTag: {
    fontSize: 12,
    padding: "3px 10px",
    borderRadius: 50,
    marginTop: 5,
  },
});

const PDFReportDocument = ({ report }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#f97316";
      case "approved":
        return "#22c55e";
      case "rejected":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Report for Need: {report.need?.title || "Untitled Need"}
          </Text>
          <Text
            style={[
              styles.statusTag,
              { backgroundColor: getStatusColor(report.status) },
            ]}
          >
            Status: {report.status.toUpperCase()}
          </Text>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Created By:</Text>
            <Text style={styles.value}>
              {report.createdBy?.name || "Unknown"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Created At:</Text>
            <Text style={styles.value}>
              {dayjs(report.createdAt).format("MMMM D, YYYY h:mm A")}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>NGO:</Text>
            <Text style={styles.value}>
              {report.NGO?.name || "Unknown NGO"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Last Updated:</Text>
            <Text style={styles.value}>
              {dayjs(report.updatedAt).format("MMMM D, YYYY h:mm A")}
            </Text>
          </View>
        </View>

        {/* Description */}
        {report.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.value}>{report.description}</Text>
          </View>
        )}

        {/* Pictures */}
        {report.pictures?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Pictures ({report.pictures.length})
            </Text>
            <View style={styles.imageContainer}>
              {report.pictures.map((pic, index) => (
                <Image
                  key={index}
                  style={styles.image}
                  src={`${process.env.REACT_APP_API_URL}/uploads/${pic.replace(
                    /\\/g,
                    "/"
                  )}`}
                />
              ))}
            </View>
          </View>
        )}

        {/* Impact Metrics */}
        {report.impactMetrics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Impact Metrics</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Beneficiaries Reached:</Text>
              <Text style={styles.value}>
                {report.impactMetrics.beneficiariesReached || "Not specified"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Communities Served:</Text>
              <Text style={styles.value}>
                {report.impactMetrics.communitiesServed?.join(", ") ||
                  "Not specified"}
              </Text>
            </View>

            {report.impactMetrics.successStories?.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
                  Success Stories
                </Text>
                {report.impactMetrics.successStories.map((story, index) => (
                  <View key={index} style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                      Story #{index + 1}:
                    </Text>
                    <Text style={{ fontSize: 12 }}>{story}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* Donations Received */}
        {(report.donations?.materials?.length > 0 ||
          report.donations?.services?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Donations Received</Text>

            {/* Material Donations */}
            {report.donations.materials?.length > 0 && (
              <View style={[styles.section, { marginBottom: 10 }]}>
                <Text style={[styles.sectionTitle, { fontSize: 14 }]}>
                  Material Donations
                </Text>
                <View style={styles.table}>
                  {/* Table Header */}
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={styles.tableCol}>Category</Text>
                    <Text style={styles.tableCol}>Subcategory</Text>
                    <Text style={styles.tableCol}>Quantity</Text>
                  </View>
                  {/* Table Rows */}
                  {report.donations.materials.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCol}>{item.category}</Text>
                      <Text style={styles.tableCol}>{item.subCategory}</Text>
                      <Text style={styles.tableCol}>
                        {item.totalQuantity} {item.unit}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Service Donations */}
            {report.donations.services?.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { fontSize: 14 }]}>
                  Service Donations
                </Text>
                {report.donations.services.map((service, index) => (
                  <View key={index} style={{ marginBottom: 10 }}>
                    <View style={styles.row}>
                      <Text style={styles.label}>Volunteer:</Text>
                      <Text style={styles.value}>
                        {service.applicant?.name || "Anonymous"}
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Service:</Text>
                      <Text style={styles.value}>
                        {service.category} ({service.subCategory})
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Duration:</Text>
                      <Text style={styles.value}>
                        {dayjs(service.startDate).format("MMM D, YYYY")} -{" "}
                        {service.endDate
                          ? dayjs(service.endDate).format("MMM D, YYYY")
                          : "Ongoing"}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default PDFReportDocument;
