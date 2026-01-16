"use client";

import { useState } from 'react';
import { getMarketDetailData } from '@/features/market/api/getMarketDetailData';

export default function TestMarketApiPage() {
  const [marketId, setMarketId] = useState('630a44c2-0fef-444b-9956-d681f180c5ef');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await getMarketDetailData(marketId);
      setResult(data);
      console.log('✅ API 测试成功！', data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      console.error('❌ API 测试失败:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">测试市场详情聚合 API</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            市场 ID:
          </label>
          <input
            type="text"
            value={marketId}
            onChange={(e) => setMarketId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="输入市场 ID"
          />
        </div>
        
        <button
          onClick={handleTest}
          disabled={loading || !marketId}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '测试中...' : '测试 API'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">❌ 错误</h2>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-800 mb-4">✅ 测试成功</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">数据概览:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Market: {result.market ? '✅' : '❌'}</li>
                <li>Market Title: {result.market?.title || 'N/A'}</li>
                <li>Question Type: {result.market?.questionType || 'N/A'}</li>
                <li>Trades: {result.marketData?.trades?.length || 0} 笔</li>
                <li>Option Markets: {result.marketData?.optionMarkets?.length || 0} 个</li>
                <li>Exclusive Market: {result.marketData?.exclusiveMarket ? '✅' : '❌'}</li>
                <li>Initial Prices: {result.marketData?.initialPrices?.length || 0} 个</li>
                <li>User: {result.user ? '✅ (已登录)' : '❌ (未登录)'}</li>
                <li>Positions: {result.positions ? '✅' : '❌'}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">完整数据 (JSON):</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">📝 测试说明:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>输入市场 ID 并点击"测试 API"按钮</li>
          <li>检查返回的数据结构是否完整</li>
          <li>查看浏览器控制台获取详细日志</li>
          <li>如果测试成功，可以开始迁移组件使用新的聚合 API</li>
        </ul>
      </div>
    </div>
  );
}
