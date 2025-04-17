export interface OTPObject{
    tries : number,
    issuedAt : number,
    lastRetry : number,
    otp : string
}

export interface IOtpGenerationResult{
    success : boolean,
    error : boolean,
    minTimeToWait : number | undefined,
    triesLeft : number
}