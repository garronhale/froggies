import React, { useState, useEffect } from 'react';
import { uploadData, getUrl, list, remove } from 'aws-amplify/storage';

function FileUploader() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Your specific bucket name
  const bucketName = 'amplifytestfrogs';
  const region = 'us-east-1'; // Change this if your bucket is in a different region

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    setLoading(true);
    try {
      console.log('Fetching files from bucket:', bucketName);
      
      // List files without specifying a path (will list all files)
      const result = await list({
        options: {
          bucket: {
            bucketName: bucketName,
            region: region
          }
        }
      });
      
      console.log('Files result:', result);
      setFiles(result.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to fetch files. ' + JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(e) {
    setSelectedFile(e.target.files[0]);
  }

  async function handleUpload() {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    try {
      console.log('Uploading file to bucket:', bucketName);
      
      // Upload to the root of the bucket without any prefix
      const result = await uploadData({
        key: selectedFile.name,
        data: selectedFile,
        options: {
          bucket: {
            bucketName: bucketName,
            region: region
          },
          // Explicitly set the access level to avoid "public/" prefix
          accessLevel: 'guest'
        }
      });
      
      console.log('Upload result:', result);
      alert('File uploaded successfully!');
      setSelectedFile(null);
      // Clear the file input
      document.getElementById('file-input').value = '';
      fetchFiles();
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload file: ' + JSON.stringify(err));
    }
  }

  async function handleDelete(key) {
    try {
      console.log('Deleting file from bucket:', bucketName);
      await remove({ 
        key,
        options: {
          bucket: {
            bucketName: bucketName,
            region: region
          },
          // Match the access level used for upload
          accessLevel: 'guest'
        }
      });
      alert('File deleted successfully!');
      fetchFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Failed to delete file: ' + JSON.stringify(err));
    }
  }

  async function handleView(key) {
    try {
      console.log('Getting URL for file from bucket:', bucketName);
      const result = await getUrl({
        key,
        options: {
          bucket: {
            bucketName: bucketName,
            region: region
          },
          // Match the access level used for upload
          accessLevel: 'guest'
        }
      });
      console.log('File URL:', result);
      window.open(result.url.toString(), '_blank');
    } catch (err) {
      console.error('Error getting file URL:', err);
      alert('Failed to get file URL: ' + JSON.stringify(err));
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>File Uploader</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          id="file-input"
          type="file"
          onChange={handleFileChange}
          style={{ marginRight: '10px' }}
        />
        <button 
          onClick={handleUpload}
          disabled={!selectedFile}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: selectedFile ? '#4CAF50' : '#ccc', 
            color: 'white', 
            border: 'none', 
            cursor: selectedFile ? 'pointer' : 'not-allowed' 
          }}
        >
          Upload
        </button>
      </div>
      
      {loading && <p>Loading files...</p>}
      
      {error && (
        <div>
          <p style={{ color: 'red' }}>{error}</p>
          <button 
            onClick={fetchFiles}
            style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )}
      
      {!loading && !error && files.length === 0 && (
        <p>No files yet. Upload one above!</p>
      )}
      
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {files.map(file => (
          <li key={file.key} style={{ 
            border: '1px solid #ddd', 
            padding: '15px', 
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>{file.key}</h3>
                <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                <p>Last Modified: {new Date(file.lastModified).toLocaleString()}</p>
              </div>
              <div>
                <button
                  onClick={() => handleView(file.key)}
                  style={{ 
                    padding: '6px 12px', 
                    backgroundColor: '#2196F3', 
                    color: 'white', 
                    border: 'none', 
                    cursor: 'pointer',
                    marginRight: '8px'
                  }}
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(file.key)}
                  style={{ 
                    padding: '6px 12px', 
                    backgroundColor: '#f44336', 
                    color: 'white', 
                    border: 'none', 
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      <div style={{ marginTop: '20px' }}>
        <p>Current Bucket: {bucketName}</p>
        <p>Region: {region}</p>
        
        <p>Debug Information:</p>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(files, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default FileUploader;
