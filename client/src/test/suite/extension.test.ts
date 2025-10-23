import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('LindenTechITConsulting.somonscript'));
  });

  test('Extension should activate', async function() {
    this.timeout(10000);
    
    const extension = vscode.extensions.getExtension('LindenTechITConsulting.somonscript');
    assert.ok(extension);
    
    // Activate the extension
    await extension!.activate();
    assert.strictEqual(extension!.isActive, true);
  });

  test('Should register somonscript language', () => {
    const languages = vscode.languages.getLanguages();
    return languages.then(langs => {
      assert.ok(langs.includes('somonscript'), 'SomonScript language should be registered');
    });
  });

  test('Should open .som file', async function() {
    this.timeout(10000);
    
    // Create a simple test document
    const content = 'тағйирёбанда салом = "Салом, ҷаҳон!";';
    const doc = await vscode.workspace.openTextDocument({
      content: content,
      language: 'somonscript'
    });
    
    assert.strictEqual(doc.languageId, 'somonscript');
    assert.ok(doc.getText().includes('салом'));
  });

  test('Should provide basic syntax highlighting', async function() {
    this.timeout(10000);
    
    const content = 'функсия салом() {\n  чоп.сабт("Салом!");\n}';
    const doc = await vscode.workspace.openTextDocument({
      content: content,
      language: 'somonscript'
    });
    
    assert.strictEqual(doc.languageId, 'somonscript');
    assert.ok(doc.getText().includes('функсия'));
    assert.ok(doc.getText().includes('чоп.сабт'));
  });
});
