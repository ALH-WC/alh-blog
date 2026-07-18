import type { StructureResolver } from 'sanity/structure';
import { SECTIONS } from '../lib/sections';

// Groups articles by chapter (and a chapter-heroes shortcut) in the Studio desk.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('The Amsterdam Guide')
    .items([
      S.listItem()
        .title('All articles')
        .child(S.documentTypeList('article').title('All articles')),
      S.listItem()
        .title('★ Chapter heroes')
        .child(
          S.documentList()
            .title('Chapter heroes')
            .filter('_type == "article" && sectionHero == true'),
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
