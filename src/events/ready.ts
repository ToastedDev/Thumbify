import { Event } from "@toastify/structures";

export default new Event({
  name: "ready",
  run: (client) => {
    console.log(`Logged in as ${client.user.tag}.`);
  },
});
