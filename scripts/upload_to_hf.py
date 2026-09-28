from huggingface_hub import HfApi
import os
print('Uploading merged model to Hugging Face...')
token = os.environ.get('HF_TOKEN')
api = HfApi(token=token)
repo_id = 'yashvasudeva/qwen-ds-merged'
api.create_repo(repo_id=repo_id, repo_type='model', exist_ok=True)
api.upload_folder(
    folder_path='merged_model',
    repo_id=repo_id,
    repo_type='model'
)
print(f'Successfully uploaded to https://huggingface.co/{repo_id}')
