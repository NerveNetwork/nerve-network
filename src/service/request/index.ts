import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { createRPCParams } from '@/utils/util';
import config from '@/config';

class Request {
 instance: AxiosInstance;

 constructor(props?: AxiosRequestConfig) {
 this.instance = axios.create(props);
 this.setInterceptors();
 }

 setInterceptors() {
 this.instance.interceptors.request.use(config => {
 return config;
 });
 this.instance.interceptors.response.use(
 response => {
 return response.data;
 },
 error => Promise.reject(error)
 );
 }

 request (config: AxiosRequestConfig): Promise {
 return new Promise((resolve, reject) => {
 this.instance
 .request (config)
 .then(res => {
 resolve(res);
 })
 .catch(error => {
 reject(error);
 })
 .finally(() => {
 //
 });
 });
 }

 get (config: AxiosRequestConfig): Promise {
 return this.request ({ ...config, method: 'GET' });
 }

 post (config: AxiosRequestConfig): Promise {
 return this.request ({ ...config, method: 'POST' });
 }

 put (config: AxiosRequestConfig): Promise {
 return this.request ({ ...config, method: 'PUT' });
 }

 delete (config: AxiosRequestConfig): Promise {
 return this.request ({ ...config, method: 'DELETE' });
 }

 rPost (method: string, params?: any) {
 const rpcParams = createRPCParams(method);
 if (params) {
 rpcParams.params = rpcParams.params.concat(params);
 }
 if (method === 'getBestSymbolPrice' || method === 'getSymbolInfo') {
 rpcParams.params.shift();
 }
 return this.request<{ result?: T; error?: T }>({
 url: '/',
 method: 'POST',
 data: rpcParams
 });
 }
 sPost (path: string, params = {}) {
 const url = config.swap_url + path;
 return this.request ({
 url,
 method: 'POST',
 data: params
 });
 /* return new Promise((resolve, reject) => {
 axios.post(url, params).then(
 res => resolve(res.data),
 err => reject(err)
 );
 }); */
 }
}

export default Request;
