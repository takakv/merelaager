import { Op } from "sequelize";
import { Bill } from "../db/models/Bill";
import { Registration } from "../db/models/Registration";

export const migrateBills = async () => {
  const registrations = await Registration.findAll({
    where: { billNr: { [Op.not]: null } },
  });

  for (const registration of registrations) {
    // Create bills based on existing registration bills.
    const [bill, created] = await Bill.findOrCreate({
      where: { id: registration.billNr },
      defaults: {
        id: registration.billNr,
        contactName: registration.contactName,
        billTotal: registration.priceToPay,
      },
    });

    // Link registrations with bills.
    if (created) {
      registration.billId = bill.id;
      await registration.save();
    }

    if (bill.isPaid === null) {
      bill.isPaid = registration.priceToPay === registration.pricePaid;
      await bill.save();
    }
  }
};
