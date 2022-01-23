import { Context, logging, storage, RNG, ContractPromiseBatch, PersistentMap } from 'near-sdk-as'

import { AccountId, ONE_NEAR, asNEAR, toYocto } from "../utils";

@nearBindgen
export class Lottery {
  private owner: AccountId;
  private chance: f64 = 0.45;

  constructor(){
    this.owner = 'amineelqara.testnet';
  }

  explain(): string {
    return "Players have a " + (this.chance * 100).toString() + "% chance of winning.";
  }

  @mutateState()
  play(): bool {
    logging.log("Received " + Context.attachedDeposit.toString());

    if (Context.attachedDeposit < (toYocto(1))) {
      logging.log("You need to deposit at least 1 NEAR to play.");
      return false;
    }

    const rng = new RNG<u32>(1, u32.MAX_VALUE);
    const roll = rng.next();
    logging.log("roll: " + roll.toString());
    const won = roll <= <u32>(<f64>u32.MAX_VALUE * this.chance);

    const signer = Context.sender;

    if (won) {
      logging.log("You won!");
    
      const to_winner = ContractPromiseBatch.create(signer);
      to_winner.transfer(toYocto(2));

      return true;
    }
    logging.log("You lost!");
    return false;

  }

  @mutateState()
  configure(chance: f64): void {
    assert(chance >= 0.000000001 && chance <= 1, "Chance must be within range (0..1]");
    this.chance = chance;
    logging.log(this.explain());
  }

}