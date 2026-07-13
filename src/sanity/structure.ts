import type { StructureResolver } from 'sanity/structure';
import { SECTIONS } from '../lib/sections';

// Groups articles by chapter (and a Featured shortcut) in the Studio desk.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('The Amsterdam Guide')
    .items([
      S.listItem()
        .title('All articles')
        .child(S.documentTypeList('article').title('All articles')),
      S.listItem()
        .title('★ Featured ("Start here")')
        .child(
          S.documentList()
            .title('Featured')
            .filter('_type == "article" && featured == true'),
        ),
      S.divider(),
      ...SECTIONS.map((section) =>
        S.listItem()
          .title(section.menu)
          .child(
            S.documentList()
              .title(section.menu)
              .filter('_type == "article" && category in $categories')
              .params({ categories: section.categories }),
          ),
      ),
    ]);
