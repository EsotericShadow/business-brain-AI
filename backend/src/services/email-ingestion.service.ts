import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EmailPayload {
  sender: string;
  recipient: string;
  subject: string;
  'body-plain': string;
  'body-html'?: string;
  attachments?: any[];
}

export class EmailIngestionService {
  public async processInboundEmail(payload: EmailPayload) {
    const {
      sender,
      recipient,
      subject,
      'body-plain': body,
      'body-html': html,
      attachments,
    } = payload;

    if (!recipient) {
      throw new Error('No recipient specified in the payload');
    }

    const forwardingAddress = await prisma.forwardingAddress.findUnique({
      where: {
        email: recipient,
      },
      include: {
        user: true,
      },
    });

    if (!forwardingAddress) {
      throw new Error('User not found for forwarding address');
    }

    const user = forwardingAddress.user;

    await prisma.email.create({
      data: {
        from: sender,
        to: recipient,
        subject: subject,
        body: body,
        html: html || '',
        attachments: attachments || [],
        userId: user.id,
      },
    });

    console.log(`Successfully ingested email from ${sender} for user ${user.email}`);
  }
}
