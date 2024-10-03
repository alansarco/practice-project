import { Page, Text, View, Document, StyleSheet, Font, Image   } from '@react-pdf/renderer';
import { logoUrl } from './logo';

Font.register({
      family: 'Open Sans',
      fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 }
      ]
    })

function formatOrdinal(number) {
      const suffixes = ['th', 'st', 'nd', 'rd'];
      const v = number % 100;
      return number + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
    }
    
function formatDate(date) {   
      const day = formatOrdinal(date.getDate());
      const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
      const year = date.getFullYear();
    
      return `${day} day of ${month}, ${year}`;
    }

const myDate = new Date();
const formattedDate = formatDate(myDate)

// Create styles
const styles = StyleSheet.create({
      logo: {
            position: 'absolute',
            top: 50, // Adjust the top position as needed
            left: 70, // Adjust the left position as needed
            width: 90, // Adjust the width as needed
            height: 90, // Adjust the height as needed
          },
        
      page: {
            color: '#1a1a1a',
            margin: 20,
            padding: 50,      
            backgroundColor: '#ffffff',
      },
      section: {
            marginLeft: 10,
            marginRight: 10,
            padding: 10,
      },
      header: {
            textAlign: 'center',
            marginBottom: '10pt',
      },
      footer: {
            textAlign: 'right',
            marginBottom: '10pt',
      },
      h1: {
            fontSize: '25pt', // Bootstrap 5 uses 30pt for h1
            marginBottom: '3pt',
            fontFamily: 'Open Sans',
      },
      h2: {
            fontSize: '20pt', // Bootstrap 5 uses 24pt for h2
            marginBottom: '3pt',
            fontFamily: 'Open Sans',
      },
      h3: {
            fontSize: '17pt', // Bootstrap 5 uses 21pt for h3
            marginBottom: '3pt',
            fontFamily: 'Open Sans',
      },
      h4: {
            fontSize: '14pt', // Bootstrap 5 uses 1.6pt for h4
            marginBottom: '3pt',
            fontWeight: 700,
            fontFamily: 'Open Sans',
      },
      h5: {
            fontSize: '12pt', // Bootstrap 5 uses 1.26pt for h5
            fontFamily: 'Open Sans',
            marginBottom: '3pt',
      },
      h6: {
            fontSize: '10pt', // Bootstrap 5 uses 12 for h6
            marginBottom: '3pt',
            fontFamily: 'Open Sans',
      },
      p: {
            fontSize: '12pt', // Bootstrap 5 uses 12 for h6
            marginBottom: '17pt',
            fontFamily: 'Open Sans',
            lineHeight: '2pt',
      },
      table: {
            width: '100%',
            marginBottom: '12pt',
            color: '#212529', // Bootstrap's table text color
      },
      tr: {
            backgroundColor: '#f8f9fa', // Bootstrap's table row background color
      },
      td: {
            padding: '9pt',
      },
      row: {
            display: 'flex',
            flexWrap: 'wrap',
            margin: '6pt', // Bootstrap uses negative margin for columns in a row
      },
      col: {
            flexBasis: 0,
            flexGrow: 1,
            maxWidth: '100%',
            padding: '6pt', // Bootstrap uses padding for columns in a row
      },
      
});
    

export default function Indigency({REQUESTOR, CAPTAIN, OFFICIALS}) {
      return (
            <Document title="Barangay Certification" wrap>
                  <Page size="A4" style={styles.page} wrap  >
                  <Image style={styles.logo} src={logoUrl} />
                  <View wrap style={styles.header}>
                        <Text style={[styles.h5, {fontWeight: 600}]}>Republic of the Philippines</Text>
                        <Text style={styles.h6}>Province of Southern Leyte</Text>
                        <Text style={styles.h6}>Muncipality of Sogod</Text>    
                        <Text style={[styles.h5, {fontWeight: 600}]}>BARANGAY SAN JOSE
                        </Text>
                        <Text style={[styles.h4, {marginTop: '5pt', fontWeight: 700}]}>OFFICE OF THE PUNONG BARANGAY</Text>
                        <Text style={[styles.h2, {marginTop: '50pt', marginBottom: '40pt', fontWeight: 700}]}>CERTIFICATE OF INDIGENCY</Text>
                  </View>     
                  <View style={styles.section}>
                        <Text style={[styles.h5, {marginBottom: '30pt', marginBottom: '30pt', fontWeight: 700}]}>TO WHOM IT MAY CONCERN:</Text>
                        <Text style={styles.p}>
                              <Text style={[{fontWeight: 700}]}>THIS IS TO CERTIFY </Text>
                              that 
                              <Text style={[{fontWeight: 700}]}> {REQUESTOR.firstname} {REQUESTOR.middlename} {REQUESTOR.lastname} {REQUESTOR.title}, {REQUESTOR.age} old, {REQUESTOR.civil_status} 
                              </Text> and a Filipino citizen a bonafide resident of Barangay San Jose, Sogod, Southern Leyte. And that the said person belongs to an indigent family in our locality.
                        </Text>
                        
                        <Text style={styles.p}>
                              <Text style={[{fontWeight: 700}]}>THIS CERTIFICATION </Text>
                              is hereby issued upon the request of the interested party financial assistance purposes only.
                        </Text>
                        <Text style={styles.p}>
                              <Text style={[{fontWeight: 700}]}>ISSUED </Text>
                              this 
                              <Text style={[{fontWeight: 700}]}> {formattedDate} </Text> at Barangay San Jose, Sogod Southern Leyte, Philippines.
                        </Text>
                  </View>     
                  <View style={styles.footer}>
                        <Text style={[styles.h4,  {marginTop: '100pt', marginRight: '30pt', textTransform: 'uppercase'}]}>
                              HON. {CAPTAIN.firstname} {CAPTAIN.middlename} {CAPTAIN.lastname} {CAPTAIN.title}
                        </Text>
                        <Text style={[styles.p, {marginTop: '5pt', marginRight: '30pt'}]}>Punong Barangay</Text>
                  </View>
                  </Page>
            </Document> 
      );

}