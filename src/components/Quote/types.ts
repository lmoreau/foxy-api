import { QuoteLineItem, QuoteLocation } from '../../types';

export interface QuotePageProps {
  setQuoteRequestId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export interface QuoteSummaryProps {
  owner: string;
  totalMRR: number;
  totalTCV: number;
  quoteStage: number;
  quoteType: number;
  opticQuote: string;
  onOpticQuoteEdit: (value: string) => Promise<void>;
}

export interface QuoteActionsProps {
  onAddLocation: () => void;
  onToggleExpand: () => void;
  expandAll: boolean;
  onCloneQuote: () => void;
  quoteStage: number;
  quoteId?: string;
  onRefresh: () => Promise<void>;
  locations: QuoteLocation[];
  lineItems: { [key: string]: QuoteLineItem[] };
  accountId?: string;
  opportunityId?: string;
}

export interface RawQuoteData {
  lineItems: { [key: string]: QuoteLineItem[] };
  locations: QuoteLocation[];
  quoteRequest: any;
}
