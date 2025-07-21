export type ItemId = string;
export type Item = {
  id: ItemId,
  name: string,
  cost: number,
  imageType: "emoji" | "png",
  image: string,
  requiredLevel: number,
}

