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

const postsQueryRepository = new PostsQueryRepository()
export const blogsQueryRepository = new BlogsQueryRepository()
const commentsQueryRepository = new CommentsQueryRepository()
const usersQueryRepository = new UsersQueryRepository()
const securityDevicesQueryRepository = new SecurityDevicesQueryRepository()

const emailAdapter = new EmailAdapter()
const blogRepository = new BlogsRepository()
const postsRepository = new PostsRepository()
const commentsRepository = new CommentsRepository()
const usersRepository = new UsersRepository()
export const authRepository = new AuthRepository()
const sessionsRepository = new SessionsRepository()

const emailManager = new EmailManager(emailAdapter)
export const jwtService = new JwtService()
const authService = new AuthService(
    authRepository,
    usersRepository,
    jwtService,
    emailManager
);
const usersService = new UsersService(usersRepository, emailManager)
const blogsService = new BlogsService(blogRepository)
const postsService = new PostsService(postsRepository, blogRepository)
const commentsService = new CommentsService(commentsRepository, postsRepository, usersRepository);
const sessionsService = new SessionsService(sessionsRepository, jwtService)

export const blogsController = new BlogsController(
    blogsService,
    postsService,
    blogsQueryRepository,
    postsQueryRepository
);

export const postsController = new PostsController(
    postsService,
    postsQueryRepository,
    commentsQueryRepository,
    commentsService
);

export const usersController = new UsersController(
    usersService,
    usersQueryRepository
);

export const commentsController = new CommentsController(
    commentsService,
    commentsQueryRepository
);

export const authController = new AuthController(
    authService,
    usersQueryRepository,
    usersService
);

export const securityDevicesController = new SecurityDevicesController(
    sessionsService,
    securityDevicesQueryRepository
);