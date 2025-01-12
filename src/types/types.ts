type JSendData = {
  [key: string]: any;
} | null;

type JSendSuccess = {
  status: "success";
  data: JSendData;
};

type JSendFail = {
  status: "fail";
  data: JSendData;
};

interface JSendErrorData {
  message: string;
  code?: number;
  data?: JSendData;
}

interface JSendError extends JSendErrorData {
  status: "error";
}

export type JSendResponse = JSendSuccess | JSendFail | JSendError;
