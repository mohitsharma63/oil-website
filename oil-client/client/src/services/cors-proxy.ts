// Simple CORS proxy for iThink Logistics API
// This can be used as a temporary solution when backend is not running

export const corsProxy = {
  // Using a public CORS proxy (for testing only)
  proxyUrl: 'https://cors-anywhere.herokuapp.com/',
  
  async makeRequest(url: string, data: any) {
    const proxiedUrl = this.proxyUrl + url;
    
    try {
      const response = await fetch(proxiedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`CORS proxy error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('CORS proxy failed:', error);
      throw error;
    }
  }
};

// Alternative: Direct API call with proper headers for CORS
export const directApiCall = async (endpoint: string, data: any) => {
  const url = `https://pre-alpha.ithinklogistics.com/api_v3${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify(data),
      mode: 'cors', // This is important
    });

    if (!response.ok) {
      throw new Error(`Direct API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Direct API call failed:', error);
    throw error;
  }
};
