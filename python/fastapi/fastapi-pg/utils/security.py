from hashlib import md5

def get_password_hash(password:str)->str:
    return md5(password.encode("utf-8")).hexdigest()

def verify_user_password(password:str, password_hash:str)->bool:
    return password_hash == get_password_hash(password)