/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// VerificationDocsPanel.jsx
import { useState } from 'react';
import Spinner from '../../common/Spinner ';
import DocumentItem from './DocumentItem';
import VerificationActions from './VerificationActions';

const VerificationDocsPanel = ({
  docs,
  user,
  userType,
  onVerify,
  onReject,
}) => {
  const [expandedDoc, setExpandedDoc] = useState(null);

  const getDocumentName = (docType) => {
    const names = {
      registrationCertificate: 'Registration Certificate',
      authorizationLetter: 'Authorization Letter',
      licenseCertificate: 'Business License',
      taxCertificate: 'Tax Certificate',
      idCard: 'ID Card',
      trainingCertificate: 'Training Certificate',
    };
    return names[docType] || docType;
  };

  const handleToggleDoc = (docType, docUrl) => {
    if (expandedDoc?.url === docUrl) {
      setExpandedDoc(null);
    } else {
      setExpandedDoc({ type: docType, url: docUrl });
    }
  };

  if (!docs) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <Spinner size="md" color="indigo" />
      </div>
    );
  }

  if (!docs.requiredDocuments || !docs.documents) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-red-500">No verification documents available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Verification Documents</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-start">
        {/* Required Documents */}
        {docs.requiredDocuments?.map(
          (docType) =>
            docs.documents[docType] && (
              <DocumentItem
                key={docType}
                docType={docType}
                docUrl={docs.documents[docType]}
                isExpanded={expandedDoc?.url === docs.documents[docType]}
                onToggle={handleToggleDoc}
                getDocumentName={getDocumentName}
              />
            )
        )}

        {/* Additional Documents */}
        {docs.documents.additionalDocs?.map((docUrl, index) => (
          <DocumentItem
            key={`additional-${index}`}
            docType="additional"
            docUrl={docUrl}
            isExpanded={expandedDoc?.url === docUrl}
            onToggle={handleToggleDoc}
            getDocumentName={getDocumentName}
          />
        ))}
      </div>

      {/* Verification actions */}
      {(docs.requiredDocuments?.length > 0 ||
        docs.documents.additionalDocs?.length > 0) && (
        <VerificationActions
          user={user}
          onVerify={onVerify}
          onReject={onReject}
        />
      )}
    </div>
  );
};

export default VerificationDocsPanel;
