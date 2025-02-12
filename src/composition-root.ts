import "reflect-metadata"
import {BlogsRepository} from "./repositories/db-repo/blogs-db-repository";
import {BlogsService} from "./domain/blogs-service";
import {PostsRepository} from "./repositories/db-repo/posts-db-repository";
import {PostsService} from "./domain/posts-service";
import {BlogsQueryRepository} from "./repositories/query-repo/blogs-query-repository";
import {PostsQueryRepository} from "./repositories/query-repo/posts-query-repository";
import {BlogsController} from "./routes/blogs/blog-controller";
import {CommentsQueryRepository} from "./repositories/query-repo/comments-query-repository";
import {CommentsRepository} from "./repositories/db-repo/comments-db-repository";
import {UsersRepository} from "./repositories/db-repo/users-db-repository";
import {CommentsService} from "./domain/comments-service";
import {PostsController} from "./routes/posts/posts-controller";
import {EmailAdapter} from "./adapter/email-adapter";
import {EmailManager} from "./application/email-manager";
import {UsersService} from "./domain/users-service";
import {UsersQueryRepository} from "./repositories/query-repo/users-query-repository";
import {UsersController} from "./routes/users/users-controller";
import {CommentsController} from "./routes/comments/comments-controller";
import {AuthRepository} from "./repositories/db-repo/auth-db-repository";
import {JwtService} from "./application/jwt-service";
import {AuthService} from "./domain/auth-service";
import {AuthController} from "./routes/auth/auth-controller";
import {SessionsRepository} from "./repositories/db-repo/sessions-db-repository";
import {SessionsService} from "./domain/sessions-service";
import {SecurityDevicesQueryRepository} from "./repositories/query-repo/security-devices-query-repository";
import {SecurityDevicesController} from "./routes/security-devices/security-devices-controller";
import {LikeRepository} from "./repositories/db-repo/like-db-repository";
import {LikeService} from "./domain/like-service";
import {Container} from "inversify";

export const container: Container = new Container();

container.bind(BlogsController).to(BlogsController)
container.bind(PostsController).to(PostsController)
container.bind(UsersController).to(UsersController)
container.bind(CommentsController).to(CommentsController)
container.bind(AuthController).to(AuthController)
container.bind(SecurityDevicesController).to(SecurityDevicesController)

container.bind(EmailAdapter).to(EmailAdapter)
container.bind(EmailManager).to(EmailManager)
container.bind(BlogsService).to(BlogsService)
container.bind(PostsService).to(PostsService)
container.bind(UsersService).to(UsersService)
container.bind(CommentsService).to(CommentsService)
container.bind(LikeService).to(LikeService)
container.bind(AuthService).to(AuthService)
container.bind(JwtService).to(JwtService)
container.bind(SessionsService).to(SessionsService)

container.bind(BlogsRepository).to(BlogsRepository)
container.bind(PostsRepository).to(PostsRepository)
container.bind(CommentsRepository).to(CommentsRepository)
container.bind(UsersRepository).to(UsersRepository)
container.bind(LikeRepository).to(LikeRepository)
container.bind(AuthRepository).to(AuthRepository)
container.bind(SessionsRepository).to(SessionsRepository)

container.bind(BlogsQueryRepository).to(BlogsQueryRepository)
container.bind(PostsQueryRepository).to(PostsQueryRepository)
container.bind(CommentsQueryRepository).to(CommentsQueryRepository)
container.bind(UsersQueryRepository).to(UsersQueryRepository)
container.bind(SecurityDevicesQueryRepository).to(SecurityDevicesQueryRepository)