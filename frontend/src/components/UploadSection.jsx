import React, { useState, useRef } from 'react';
import { parseCSVText } from '../utils/csvParser';

export default function UploadSection({
  onUploadComplete,
  isLoading,
  setIsLoading,
  onError,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      onError('Please upload a CSV or Excel file.');
      return;
    }

    setSelectedFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      let parsedRows = [];
      try {
        const text = await selectedFile.text();
        const parsed = parseCSVText(text, 1000);
        parsedRows = parsed.rows || [];
      } catch (err) {
        console.warn('Could not parse CSV text in client:', err);
      }
      await onUploadComplete(selectedFile, parsedRows);
    } catch (err) {
      console.error('Upload processing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sample CSV generator for immediate 1-click test
  const loadSampleDataset = () => {
    const sampleCsvContent = `Campaign_ID,Company,Campaign_Type,Target_Audience,Duration_Days,Channel_Used,Acquisition_Cost,ROI,Conversion_Rate,Location
CMP-101,Acme Corp,Search,Enterprise B2B,30,Google Ads,4200,4.82,8.4,North America
CMP-102,TechFlow,Social,Millennials,14,Meta Ads,3100,3.95,7.2,North America
CMP-103,CloudScale,Influencer,Tech Leaders,45,LinkedIn Ads,6400,5.10,9.1,EMEA
CMP-104,FinPrime,Display,Young Adults,21,TikTok Ads,2800,2.15,4.8,APAC
CMP-105,RetailX,Search,Retail Buyers,30,Google Ads,3900,4.60,8.1,North America
CMP-106,BioHealth,Social,Healthcare Execs,60,Meta Ads,5100,4.20,7.9,EMEA
CMP-107,EduGlobal,Search,Students,28,Google Ads,2200,3.40,6.5,APAC
CMP-108,SafeGuard,Webinar,Security Admins,15,LinkedIn Ads,4800,5.40,9.8,North America
CMP-109,LogiMove,Display,Supply Chain,35,Meta Ads,3300,3.10,5.9,Global
CMP-110,PaySwift,Search,SMB Owners,42,Google Ads,4600,4.75,8.3,North America`;

    const blob = new Blob([sampleCsvContent], { type: 'text/csv' });
    const sampleFile = new File([blob], 'marketing_campaigns.csv', { type: 'text/csv' });
    setSelectedFile(sampleFile);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 flex flex-col items-center text-center animate-fade-in">
      {/* Title & Subtitle */}
      <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
        AI POWER BI DASHBOARD GENERATOR
      </h1>
      <p className="text-sm text-secondary mt-2 mb-8">
        Turn your CSV data into an intelligent BI dashboard
      </p>

      {/* Upload Card */}
      <div className="w-full bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 shadow-sm flex flex-col items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv, .xlsx, .xls"
          className="hidden"
          onChange={handleChange}
        />

        {selectedFile ? (
          /* File Selected Card */
          <div className="w-full flex flex-col items-center gap-5">
            <div className="w-full p-6 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-4xl text-primary">
                description
              </span>
              <span className="font-bold text-base text-on-surface">
                {selectedFile.name}
              </span>
              <span className="text-xs text-secondary">
                {(selectedFile.size / 1024).toFixed(1)} KB • Ready for analysis
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-secondary hover:text-on-surface"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing Dataset...</span>
                  </>
                ) : (
                  <span>Analyze Dataset</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Drag & Drop Box */
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full py-12 px-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
              dragActive
                ? 'border-primary bg-primary-fixed/20'
                : 'border-outline-variant/60 bg-surface-container-low hover:bg-surface-container-high/60'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-3xl">folder_open</span>
            </div>
            <span className="font-bold text-sm text-on-surface">Upload CSV</span>
            <p className="text-xs text-secondary mt-1">Drag & drop your CSV here</p>
          </div>
        )}

        {/* Sample data helper */}
        {!selectedFile && (
          <div className="mt-6 pt-4 border-t border-outline-variant/20 w-full flex items-center justify-center">
            <button
              type="button"
              onClick={loadSampleDataset}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">auto_fix_high</span>
              <span>Or click here to load a sample marketing dataset</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
