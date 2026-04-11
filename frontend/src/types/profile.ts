
export interface UserInfo {
  name: string;
  email: string;
  accountType: string;
  memberSince: string;
  avatar: string;
}

export interface OrderItem {
  id: string;
  item: string;
  date: string;
  status: string;
  amount: string;
  image: string;
}

export interface BidItem {
  id: string;
  item: string;
  date: string;
  status: string;
  bidAmount: string;
  currentBid: string;
  endsIn: string;
  image: string;
}

export interface AuctionItem {
  id: string;
  title: string;
  currentBid: string;
  endsIn: string;
  image: string;
}
