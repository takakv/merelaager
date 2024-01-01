import MailService from "../controllers/MailService";

class GlobalStore {
  /**
   * Time at which registration unlocks, if not already unlocked.
   */
  static registrationUnlockTime = new Date(
    Date.parse("01 Jan 2024 11:59:59 UTC")
  );
  /**
   * The current registration order.
   */
  static registrationOrder = 1;
  /**
   * The current bill number to invoice.
   */
  static billNumber = 0;
  /**
   * Whether registration is allowed through the registration portal.
   */
  static registrationUnlocked = false;
  /**
   * The service used for sending various emails.
   */
  static mailService: MailService;
}

export default GlobalStore;
