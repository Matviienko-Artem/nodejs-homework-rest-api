const { updateContact } = require("../controllers/contacts");
const Contacts = require("../repositories/contacts");

jest.mock("../repositories/contacts");
describe("Unit test controller contacts", () => {
  const req = { user: { id: 1 }, body: {}, params: { id: 1 } };
  const res = jest.fn();
  const next = jest.fn();
  it("test update contact", async () => {
    Contact.updateContact = jest.fn(() => {
      return { contact: { id: 3 } };
    });
    const result = await updateContact(req, res, next);
  });
});
