export interface CategoryNode{
    databaseId: number;
    name: string;
    slug: string;
    parent: {
        node: {
            databaseId: number;
        }
    }
}