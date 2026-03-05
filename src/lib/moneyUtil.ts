import { Money } from '@decentralchain/data-entities';

interface MoneyLike {
  assetId: string;
  value: string;
}

export function moneylikeToMoney(moneylike: { value: string | number }, asset: any): Money {
  return new Money(moneylike.value, asset);
}

export function moneyToMoneylike(money: Money): MoneyLike {
  return {
    assetId: money.asset.id,
    value: money.getCoins().toString(),
  };
}
