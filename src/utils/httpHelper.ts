interface ICallback {
  data?: any,
  success: boolean,
  errMsg: string,
  code: number;
  [s: string]: any;
}

type httpSuccOpts = {
  data: any,
  extentions?: Object;
};
type httpErrOpts = {
  code: number,
  errMsg: string,
  status?: number;
  data?: any;
};

export const httpHelper = {
  success: (opts: httpSuccOpts): ICallback => ({
    success: true,
    code: 0,
    errMsg: '',
    data: opts.data ?? null,
    ...(opts.extentions || {})
  }),
  error: (opts: httpErrOpts): ICallback | string => opts.status && opts.status < 500 ? ({
    success: false,
    code: opts.code,
    errMsg: opts.errMsg,
    data: opts.data || null,
  }) : 'Internal Server Error'
};


export default httpHelper