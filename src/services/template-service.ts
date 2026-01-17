import { LazyStore } from '@tauri-apps/plugin-store';
import { info, error as logError } from '@tauri-apps/plugin-log';

/**
 * Service layer for template CRUD operations.
 * Abstracts Tauri plugin interactions for template management.
 */
class TemplateService {
  private store: LazyStore;
  private templates: Record<string, string> = {};

  constructor() {
    this.store = new LazyStore('templates.json');
  }

  /**
   * Load all templates from storage.
   */
  async loadTemplates(): Promise<Record<string, string>> {
    try {
      const data = await this.store.get<{ templates: Record<string, string> }>('data');
      if (data && data.templates) {
        this.templates = data.templates;
        await info(`Loaded ${Object.keys(this.templates).length} templates from store`);
        return this.templates;
      }
      await info('No templates found in store, returning empty object');
      this.templates = {};
      return {};
    } catch (err) {
      await logError(`Failed to load templates: ${err}`);
      this.templates = {};
      return {}; // Return empty on error to allow app to function
    }
  }

  /**
   * Save templates to storage.
   */
  async saveTemplates(): Promise<void> {
    try {
      const data = { templates: this.templates };
      await this.store.set('data', data);
      await this.store.save();
      await info(`Saved ${Object.keys(this.templates).length} templates to store`);
    } catch (err) {
      await logError(`Failed to save templates: ${err}`);
      throw new Error(`Failed to save templates: ${err}`);
    }
  }

  /**
   * Get template for a specific folder path.
   */
  getTemplate(folderPath: string): string | undefined {
    return this.templates[folderPath];
  }

  /**
   * Set template for a specific folder path.
   */
  async setTemplate(folderPath: string, content: string): Promise<void> {
    this.templates[folderPath] = content;
    await this.saveTemplates();
  }

  /**
   * Remove template for a specific folder path.
   */
  async removeTemplate(folderPath: string): Promise<void> {
    delete this.templates[folderPath];
    await this.saveTemplates();
  }
}

export const templateService = new TemplateService();
export { TemplateService };
