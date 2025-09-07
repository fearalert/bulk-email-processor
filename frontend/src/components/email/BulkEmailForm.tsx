/** @format */

import React, { useState, useEffect } from 'react';
import { Send, Upload, X, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import toast from 'react-hot-toast';
import { emailApi } from '../../api/api';
import { useAuth } from '../../contexts/Authcontext';

interface Template {
  id: number;
  name: string;
  subject: string;
  body: string;
}

interface BulkEmailFormProps {
  onEmailsSent: (data: any) => void;
}

export const BulkEmailForm = ({ onEmailsSent }: BulkEmailFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    emails: '',
    subject: '',
    body: '',
    templateId: 0,
  });
  const [emailList, setEmailList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await emailApi.getTemplates(token!);
        setTemplates(response.templates || []);
      } catch (err: any) {
        toast.error('Failed to fetch email templates');
        console.error(err);
      }
    };
    fetchTemplates();
  }, []);

  // Select template card
  const handleTemplateSelect = (template: Template) => {
    setFormData((prev) => ({
      ...prev,
      templateId: template.id,
      subject: template.subject,
      body: template.body,
    }));
    toast.success(`Template "${template.name}" selected`);
  };

  // Input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Emails text area
  const handleEmailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, emails: value }));
    const emails = value
      .split(/[,\n]/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
    setEmailList(emails);
  };

  // File upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const emails = content
        .split(/[,\n\r]/)
        .map((email) => email.trim())
        .filter((email) => email.length > 0 && email.includes('@'));

      setFormData((prev) => ({ ...prev, emails: emails.join('\n') }));
      setEmailList(emails);
      toast.success(`Loaded ${emails.length} emails from file`);
    };
    reader.readAsText(file);
  };

  // Drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Remove single email
  const removeEmail = (index: number) => {
    const newEmails = emailList.filter((_, i) => i !== index);
    setEmailList(newEmails);
    setFormData((prev) => ({ ...prev, emails: newEmails.join('\n') }));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailList.length === 0) {
      toast.error('Please add at least one email address');
      return;
    }
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!formData.body.trim()) {
      toast.error('Please enter email body');
      return;
    }

    setLoading(true);
    try {
      const response = await emailApi.sendBulkEmails({
        emails: emailList,
        templateId: formData.templateId,
        subject: formData.subject,
        body: formData.body,
      });
      toast.success(`Successfully queued ${response.successful} emails!`);
      onEmailsSent(response);

      // Reset but keep templates
      setFormData({
        emails: '',
        subject: '',
        body: '',
        templateId: 0,
      });
      setEmailList([]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send emails');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Send Bulk Emails</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>User ID: {user?.id}</span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6">
        {/* Template Grid */}
        {templates.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Choose a Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`cursor-pointer border rounded-lg p-4 hover:shadow-md transition ${
                    formData.templateId === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}>
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-medium text-gray-900">
                      {template.name}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {template.subject}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {template.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Addresses ({emailList.length} emails)
          </label>

          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}>
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload CSV file or drag and drop
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    Or type/paste emails below
                  </span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".csv,.txt"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFileUpload(e.target.files[0])
                  }
                />
              </div>
            </div>
          </div>

          <textarea
            name="emails"
            value={formData.emails}
            onChange={handleEmailsChange}
            placeholder="Enter emails separated by commas or new lines..."
            className="mt-4 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={6}
          />

          {emailList.length > 0 && (
            <div className="mt-4 max-h-40 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {emailList.slice(0, 10).map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => removeEmail(index)}
                      className="text-blue-600 hover:text-blue-800">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {emailList.length > 10 && (
                  <div className="flex items-center text-sm text-gray-500 px-3 py-1">
                    +{emailList.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Subject & Body (editable) */}
        <Input
          label="Email Subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Enter email subject"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Body
          </label>
          <textarea
            name="body"
            value={formData.body}
            onChange={handleChange}
            placeholder="Enter your email content here..."
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={8}
            required
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading}
            icon={<Send className="h-4 w-4" />}
            disabled={emailList.length === 0}>
            Send Bulk Emails
          </Button>
        </div>
      </form>
    </Card>
  );
};
