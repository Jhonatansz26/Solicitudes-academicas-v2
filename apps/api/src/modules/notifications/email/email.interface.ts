export interface EmailAttachment {
  filename: string
  content: Buffer
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  attachments?: EmailAttachment[]
}

export interface IEmailProvider {
  send(options: EmailOptions): Promise<void>
}
