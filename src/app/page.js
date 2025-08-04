"use client";
import React, { useState, useEffect } from 'react';
import { FileText, Mail, Zap, Database, CheckCircle, AlertCircle, Loader, Upload, Eye, Send } from 'lucide-react';

const Home = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState({
    email: null,
    rawPO: null,
    processedSO: null,
    netsuiteResponse: null
  });
  const [logs, setLogs] = useState([]);
  const [config, setConfig] = useState({
    gmailSender: '',
    gmailSenderEmail: '',
    openaiKey: '',
    netsuiteConfig: {
      consumerKey: '7be986c1bd9613e3608d6ec94c8b6922c9f343a1a5236c5f78c3ec68a06662b7',
      consumerSecret: '3e38a81a0710c659fffdfa0e400a3bf543650436116501c666652e9620b9de5c',
      accessToken: '7bf25bce164d7cadc5a2e53af2d920f7d6b3f42d24cc431985b35fb4da4b388e',
      tokenSecret: '908f9683c47f7b52aabaec4781c2a025eb14eae4934c4a4978fb36cdc6c3ccce',
      realm: '9855553_SB1',
      baseUrl: 'https://9855553-sb1.suitetalk.api.netsuite.com/services/rest/record/v1'
    }
  });

  const steps = [
    { id: 0, name: 'Configuration', icon: Upload, description: 'Set up API keys and sender details' },
    { id: 1, name: 'Gmail Fetch', icon: Mail, description: 'Fetch PO email from Gmail' },
    { id: 2, name: 'Extract PO Data', icon: FileText, description: 'Parse PDF and extract PO data' },
    { id: 3, name: 'AI Processing', icon: Zap, description: 'Transform to NetSuite format' },
    { id: 4, name: 'NetSuite SO', icon: Database, description: 'Create Sales Order' }
  ];

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  // Mock Gmail API call
  const fetchGmailEmail = async () => {
    addLog('Connecting to Gmail API...', 'info');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockEmail = {
      subject: 'Purchase Order #9 - Test Customer',
      sender: config.gmailSender,
      senderEmail: config.gmailSenderEmail,
      body: 'Please find attached Purchase Order #9 for immediate processing.',
      attachments: ['Purchase_Order_PO9.pdf'],
      receivedDate: new Date().toISOString()
    };
    
    addLog('Email fetched successfully', 'success');
    return mockEmail;
  };

  // Mock PDF parsing and PO extraction
  const extractPOData = async (email) => {
    addLog('Parsing PDF attachment...', 'info');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const rawPOData = {
      poNumber: '9',
      vendor: 'Test Vendor',
      customer: '1186 Test Customer',
      customerId: '3550',
      terms: 'Net 30',
      shipTo: {
        name: 'Test Customer',
        address: 'Shivaji Nagar',
        state: 'Maharashtra',
        country: 'India'
      },
      billTo: {
        name: 'Test Customer',
        address: 'Shivaji Nagar',
        state: 'Maharashtra',
        country: 'India'
      },
      items: [
        {
          name: 'ItemA',
          itemId: '1125',
          quantity: 15,
          rate: 25.00,
          amount: 375.00
        },
        {
          name: 'ItemB',
          itemId: '1126',
          quantity: 10,
          rate: 40.00,
          amount: 400.00
        }
      ],
      total: 775.00,
      extractedFrom: email.subject,
      extractedAt: new Date().toISOString()
    };
    
    addLog('PO data extracted successfully', 'success');
    return rawPOData;
  };

  // Mock OpenAI API call
  const processWithOpenAI = async (rawPOData) => {
    addLog('Calling OpenAI API for transformation...', 'info');
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const netSuiteSO = {
      entity: rawPOData.customerId,
      tranDate: new Date().toISOString().split('T')[0],
      terms: rawPOData.terms,
      memo: `Sales Order created from PO #${rawPOData.poNumber}`,
      shipAddress: {
        addr1: rawPOData.shipTo.address,
        state: rawPOData.shipTo.state,
        country: rawPOData.shipTo.country
      },
      billAddress: {
        addr1: rawPOData.billTo.address,
        state: rawPOData.billTo.state,
        country: rawPOData.billTo.country
      },
      item: rawPOData.items.map(item => ({
        item: item.itemId,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount
      })),
      customFieldList: {
        customField: [
          {
            scriptId: 'custbody_po_reference',
            value: rawPOData.poNumber
          }
        ]
      }
    };
    
    addLog('OpenAI transformation completed', 'success');
    return netSuiteSO;
  };

  // Mock NetSuite API call
  const createNetSuiteSO = async (soData) => {
    addLog('Creating Sales Order in NetSuite...', 'info');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = {
      id: 'SO-12345',
      internalId: '98765',
      tranId: 'SO-12345',
      status: 'Pending Fulfillment',
      total: soData.item.reduce((sum, item) => sum + item.amount, 0),
      createdDate: new Date().toISOString(),
      links: [
        {
          rel: 'self',
          href: `${config.netsuiteConfig.baseUrl}/salesorder/98765`
        }
      ]
    };
    
    addLog('Sales Order created successfully in NetSuite', 'success');
    return response;
  };

  const executeWorkflow = async () => {
    if (!config.gmailSender || !config.gmailSenderEmail || !config.openaiKey) {
      addLog('Please fill in all required configuration fields', 'error');
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    
    try {
      // Step 1: Fetch Gmail
      setCurrentStep(1);
      const email = await fetchGmailEmail();
      setResults(prev => ({ ...prev, email }));

      // Step 2: Extract PO Data
      setCurrentStep(2);
      const rawPO = await extractPOData(email);
      setResults(prev => ({ ...prev, rawPO }));

      // Step 3: AI Processing
      setCurrentStep(3);
      const processedSO = await processWithOpenAI(rawPO);
      setResults(prev => ({ ...prev, processedSO }));

      // Step 4: NetSuite SO Creation
      setCurrentStep(4);
      const netsuiteResponse = await createNetSuiteSO(processedSO);
      setResults(prev => ({ ...prev, netsuiteResponse }));

      addLog('🎉 Workflow completed successfully!', 'success');
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetWorkflow = () => {
    setCurrentStep(0);
    setResults({
      email: null,
      rawPO: null,
      processedSO: null,
      netsuiteResponse: null
    });
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            SankalvaX PO → SO Workflow
          </h1>
          <p className="text-xl text-gray-600">
            End-to-end Purchase Order to Sales Order automation
          </p>
        </div>

        {/* Configuration Panel */}
        {currentStep === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Upload className="mr-2 text-blue-600" />
              Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gmail Sender Name
                </label>
                <input
                  type="text"
                  value={config.gmailSender}
                  onChange={(e) => setConfig(prev => ({ ...prev, gmailSender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Test Vendor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gmail Sender Email
                </label>
                <input
                  type="email"
                  value={config.gmailSenderEmail}
                  onChange={(e) => setConfig(prev => ({ ...prev, gmailSenderEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="sender@company.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={config.openaiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, openaiKey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="sk-..."
                />
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">NetSuite Configuration (Pre-configured)</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Realm:</span> {config.netsuiteConfig.realm}</p>
                <p><span className="font-medium">Base URL:</span> {config.netsuiteConfig.baseUrl}</p>
                <p><span className="font-medium">Customer ID Mapping:</span> 1186 Test Customer → 3550</p>
                <p><span className="font-medium">Item Mappings:</span> ItemA → 1125, ItemB → 1126</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`absolute h-0.5 w-16 mt-6 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} style={{ left: `${(index + 1) * 20}%` }} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center space-x-4">
            <button
               onClick={executeWorkflow}
               disabled={isProcessing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isProcessing ? (
                <>
                  <Loader className="animate-spin mr-2" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2" size={20} />
                  Start Workflow
                </>
              )}
            </button>
            <button
              onClick={resetWorkflow}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Email Data */}
          {results.email && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Mail className="mr-2 text-blue-600" />
                Gmail Email Data
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Subject:</span> {results.email.subject}</p>
                <p><span className="font-medium">From:</span> {results.email.sender} ({results.email.senderEmail})</p>
                <p><span className="font-medium">Body:</span> {results.email.body}</p>
                <p><span className="font-medium">Attachments:</span> {results.email.attachments.join(', ')}</p>
              </div>
            </div>
          )}

          {/* Raw PO Data */}
          {results.rawPO && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="mr-2 text-green-600" />
                Extracted PO Data
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-64">
                <pre className="text-xs">{JSON.stringify(results.rawPO, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Processed SO Data */}
          {results.processedSO && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Zap className="mr-2 text-purple-600" />
                AI-Processed SO Data
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-64">
                <pre className="text-xs">{JSON.stringify(results.processedSO, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* NetSuite Response */}
          {results.netsuiteResponse && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Database className="mr-2 text-indigo-600" />
                NetSuite Response
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Sales Order ID:</span> {results.netsuiteResponse.id}</p>
                <p><span className="font-medium">Internal ID:</span> {results.netsuiteResponse.internalId}</p>
                <p><span className="font-medium">Status:</span> {results.netsuiteResponse.status}</p>
                <p><span className="font-medium">Total:</span> ${results.netsuiteResponse.total}</p>
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-800 font-medium">✅ Sales Order Created Successfully!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logs */}
        {logs.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Eye className="mr-2 text-gray-600" />
              Process Logs
            </h3>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm max-h-64 overflow-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-500">[{log.timestamp}]</span>
                  <span className={`ml-2 ${
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'error' ? 'text-red-400' :
                    'text-blue-400'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>SankalvaX Assignment - PO to SO Workflow Demo</p>
          <p className="text-sm">Built with Next.js, React, and Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
