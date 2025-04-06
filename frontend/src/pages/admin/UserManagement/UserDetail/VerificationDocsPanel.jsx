/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { FiDownload } from 'react-icons/fi';
import Spinner from '../../common/Spinner ';

const VerificationDocsPanel = ({ docs, userType, onVerify, onReject }) => {
  console.log('VerificationDocsPanel', docs);
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

      <div className="space-y-4">
        {/* Safely render required documents */}
        {Array.isArray(docs.requiredDocuments) &&
          docs.requiredDocuments.map((docType) => (
            <div key={docType} className="border-b pb-4">
              <h4 className="font-medium text-gray-700">
                {getDocumentName(docType)}
              </h4>
              {docs.documents[docType] ? (
                <a
                  href={`http://localhost:5000/uploads/${docs.documents[docType]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mt-2"
                >
                  <FiDownload className="mr-2" />
                  Download Document
                </a>
              ) : (
                <p className="text-red-500 mt-2">Document not provided</p>
              )}
            </div>
          ))}

        {/* Safely render additional documents */}
        {Array.isArray(docs.documents.additionalDocs) &&
          docs.documents.additionalDocs.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700">
                Additional Documents
              </h4>
              <div className="space-y-2 mt-2">
                {docs.documents.additionalDocs.map((doc, index) => (
                  <div key={index} className="flex items-center">
                    <FiDownload className="mr-2 text-gray-500" />
                    <a
                      href={`http://localhost:5000/uploads/${doc}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Document {index + 1}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Verification actions - only show if we have documents */}
      {(docs.requiredDocuments.length > 0 ||
        docs.documents.additionalDocs?.length > 0) && (
        <div className="flex space-x-4 mt-6">
          <button
            onClick={onVerify}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Approve Verification
          </button>
          <button
            onClick={onReject}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Reject Verification
          </button>
        </div>
      )}
    </div>
  );
};

export default VerificationDocsPanel;
