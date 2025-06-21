import axios from 'axios';

let BaseApi = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}/api`,
    responseType: 'blob', // Set the response type to 'blob' for binary data
});
let Api = function(){
    let token = localStorage.getItem('token');
    if (token) {
        token = token.trim(); // remove any newlines or spaces
        BaseApi.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
    return BaseApi;
}
export default Api;