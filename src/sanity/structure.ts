import type { StructureResolver } from 'sanity/structure';

// Groups articles by journey stage in the Studio desk for easy editing.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('The Amsterdam Guide')
    .items([
      S.listItem()
        .title('All articles')
        .child(S.documentTypeList('article').title('All articles')),
      S.divider(),
      ...[1, 2, 3, 4, 5].map((stage) =>
        S.listItem()
          .title(`0${stage} · Stage ${stage}`)
          .child(
            S.documentList()
              .title(`Stage ${stage}`)
              .filter('_type == "article" && stage == $stage')
              .params({ stage })
          )
      ),
    ]);
